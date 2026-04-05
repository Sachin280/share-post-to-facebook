import { getApiKey } from './api.js';
import { formatApiError, extractRetryDelay } from './error_formatter.js';

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const errorBody = await response.text();
        lastError = new Error(`Vision API rate limit hit (429): ${errorBody}`);
        console.warn(`${lastError.message}. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2; // Exponential backoff
        continue; // Retry the request
      }
      return response; // Success
    } catch (error) {
      lastError = error;
      if (i === retries - 1) break; // Last retry failed, break to throw
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
  throw lastError || new Error('Vision API request failed after multiple retries.');
}

async function makeApiCall(apiKey, requestBody) {
  const visionApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetchWithRetry(visionApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Vision API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    // Check for promptFeedback which indicates blocking
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(`Request was blocked by the API. Reason: ${data.promptFeedback.blockReason}`);
    }
    throw new Error('Invalid vision API response structure');
  }
  
  return data.candidates[0].content.parts[0].text;
}


export async function processWithScreenshot(inputData, extraPrompt) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const apiKey = await getApiKey();

    // 1. Inject scripts into all frames to create numbered overlays
    // This is done sequentially to ensure numbering is correct across frames.

    // First, remove any existing overlays from all frames
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => {
        document.querySelectorAll('.form-field-overlay').forEach(e => e.remove());
      }
    });

    // This function will be injected into each frame to find fields and draw overlays
    const injectionFunc = (startIndex) => {
      const fields = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select, [contenteditable="true"]'))
        .filter(field => {
          if (field.offsetParent === null) return false; // Skip hidden elements
          // For contenteditable, check if it's a simple text field or a complex editor
          if (field.isContentEditable) {
            // Exclude elements that are likely entire documents or large containers
            if (field.tagName === 'BODY' || field.tagName === 'HTML' || field.id === 'app') return false;
            // A simple heuristic: if it contains block-level elements, it might be a container.
            // This is not perfect but helps avoid overlaying the whole page body.
            if (field.querySelector('div, p, h1, h2, h3')) {
               // Only include it if it has a very specific role like 'textbox'
               return field.getAttribute('role') === 'textbox';
            }
          }
          return true;
        });

      fields.forEach((field, index) => {
        const rect = field.getBoundingClientRect();
        const overlay = document.createElement('div');
        
        overlay.className = 'form-field-overlay';
        overlay.style.position = 'absolute';
        // Position relative to the frame's viewport
        overlay.style.left = `${window.scrollX + rect.left}px`;
        overlay.style.top = `${window.scrollY + rect.top}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.backgroundColor = 'rgba(255, 165, 0, 0.5)';
        overlay.style.color = 'black';
        overlay.style.fontSize = '14px';
        overlay.style.fontWeight = 'bold';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '99999';
        overlay.style.pointerEvents = 'none';
        
        const fieldNumber = startIndex + index + 1;
        overlay.textContent = `${fieldNumber}`;
        overlay.dataset.fieldNumber = fieldNumber;
        
        document.body.appendChild(overlay);
      });

      return fields.length;
    };

    // Get all frames and inject the script sequentially to manage numbering
    const frames = (await chrome.webNavigation.getAllFrames({ tabId: tab.id }))
      .sort((a, b) => a.frameId - b.frameId);
      
    let totalFields = 0;
    for (const frame of frames) {
      // Avoid injecting into blank or non-http frames which can cause errors
      if (!frame.url || !frame.url.startsWith('http')) continue;

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id, frameIds: [frame.frameId] },
          func: injectionFunc,
          args: [totalFields],
          world: 'MAIN'
        });

        if (results && results[0] && results[0].result) {
          totalFields += results[0].result;
        }
      } catch (e) {
        console.warn(`Could not inject script into frame ${frame.frameId} (${frame.url}): ${e.message}`);
      }
    }

    // 2. Wait for overlays to render, then take screenshot
    await new Promise(resolve => setTimeout(resolve, 1500));
    const screenshotDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg' });

    // 3. Remove overlays
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => { document.querySelectorAll('.form-field-overlay').forEach(e => e.remove()); }
    });

    // --- STEP 1: Detect fields using Vision API ---
    const detectionPrompt = `You are a helpful AI assistant that detects form fields in a screenshot.
Analyze the screenshot and return a JSON list where each item represents a detected form field. Each item should contain:
1. "label": The text label you can identify for the form field (e.g., "Full Name", "Email Address").
2. "box_2d": The bounding box of the input field itself.

The order of the items in the list should match the numbered overlays on the screenshot. Return ONLY the JSON list.`;

    const detectionRequestBody = {
      contents: [{
        parts: [
          { text: detectionPrompt },
          { inline_data: { mime_type: 'image/jpeg', data: screenshotDataUrl.split(',')[1] } }
        ]
      }],
      generationConfig: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    };

    console.log("Sending field detection request to Vision API...");
    const detectionResponseText = await makeApiCall(apiKey, detectionRequestBody);
    console.log("Field detection response:", detectionResponseText);

    let detectedFields;
    try {
      const jsonMatch = detectionResponseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in vision detection response');
      detectedFields = JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error(`Failed to parse field detection response: ${e.message}`);
    }

    if (!detectedFields || detectedFields.length === 0) {
      throw new Error("No fields were detected in the screenshot.");
    }

    // --- STEP 2: Map user data to detected fields using a text-only API call ---
    const detectedFieldsJson = {};
    detectedFields.forEach((field, index) => {
      detectedFieldsJson[index + 1] = field.label || 'unlabeled';
    });

    const mappingPrompt = `You are a data mapping expert. Your task is to fill in the values of a JSON object based on the user's data.

Here is the user's data:
---
${inputData}
---

${extraPrompt ? `Here are special instructions for this page:
---
${extraPrompt}
---` : ''}

Here is a JSON object representing the fields on a form. The keys are the field numbers and the values are their labels:
---
${JSON.stringify(detectedFieldsJson, null, 2)}
---

Your task is to return a new JSON object with the same numeric keys, but where the values are the corresponding data from the user's input. If a field from the form does not have a corresponding value in the user's data, omit it from your response.

Example Response:
{
  "1": "John Doe",
  "3": "123 Main St"
}

Return ONLY the JSON object containing the mapped data.`;

    const mappingRequestBody = {
      contents: [{ parts: [{ text: mappingPrompt }] }]
    };

    console.log("Sending data mapping request to API...");
    const mappingResponseText = await makeApiCall(apiKey, mappingRequestBody);
    console.log("Data mapping response:", mappingResponseText);

    let fieldMapping;
    try {
      const jsonMatch = mappingResponseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON object found in data mapping response');
      fieldMapping = JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error(`Failed to parse data mapping response: ${e.message}`);
    }

    // --- STEP 3: Fill the form ---
    // Ensure the content script is injected before sending the message.
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ['content.js']
    });

    // --- STEP 4: Fill the form by sending messages to each frame ---
    let totalFilledCount = 0;
    const mappingEntries = Object.entries(fieldMapping);

    for (const frame of frames) {
      if (!frame.url || !frame.url.startsWith('http')) continue;

      try {
        const result = await chrome.tabs.sendMessage(frame.tabId, {
          type: 'fill_by_number',
          data: { fieldMapping }
        }, { frameId: frame.frameId });

        if (result && result.success) {
          totalFilledCount += result.filledCount;
        }
      } catch (e) {
        // It's common for frames to not have the content script or a listener,
        // so we can often ignore these errors.
        if (!e.message.includes("Could not establish connection") && !e.message.includes("Receiving end does not exist")) {
          console.warn(`Error sending message to frame ${frame.frameId}: ${e.message}`);
        }
      }
    }

    chrome.runtime.sendMessage({
        type: 'form_filled',
        success: totalFilledCount > 0,
        filledCount: totalFilledCount,
        totalFields: mappingEntries.length,
        source: 'screenshot'
    });

  } catch (error) {
    console.error('Screenshot fill failed:', error);
    const friendlyError = formatApiError(error);
    const retryDelay = extractRetryDelay(error);
    chrome.runtime.sendMessage({
      type: 'form_filled',
      success: false,
      error: friendlyError + retryDelay,
      source: 'screenshot'
    });
  }
}
