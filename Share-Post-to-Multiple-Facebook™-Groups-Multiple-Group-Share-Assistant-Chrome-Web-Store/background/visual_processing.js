import { getApiKey } from './api.js';
import { performOcr } from './ocr.js';
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
  throw lastError || new Error('API request failed after multiple retries.');
}

// Process visually detected fields with AI
export async function processVisualFieldsWithAI(fields, inputData) {
  try {
    const apiKey = await getApiKey();
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    console.log('Processing visual fields with AI...');
    chrome.runtime.sendMessage({ type: 'visual_fields_mapped' });
    
    const prompt = `You are an expert form-filling AI. Your task is to map user data to a list of visually detected form fields.

Here is the user's data:
---
${inputData}
---

Here is a JSON list of the fields detected on the form, with their corresponding indices:
---
${JSON.stringify(fields, null, 2)}
---

Your task is to return a JSON object that maps the field *index* (as a string) to the corresponding value from the user's data.

- Match fields intelligently based on their labels.
- Only include fields for which you can find a corresponding value in the user's data.

Example Response:
{
  "0": "John Doe",
  "2": "john@example.com"
}

Return ONLY the JSON object.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    };

    const response = await fetchWithRetry(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    let mapping;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      mapping = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response: ' + parseError.message);
    }

    // Prepare the data for batch filling
    const fieldsToFill = [];
    for (const [fieldIndex, value] of Object.entries(mapping)) {
      const index = parseInt(fieldIndex, 10);
      if (index >= 0 && index < fields.length && value) {
        const field = fields[index];
        fieldsToFill.push({
          x: field.x + field.width / 2,
          y: field.y + field.height / 2,
          value: value
        });
      }
    }

    if (fieldsToFill.length === 0) {
      throw new Error("AI could not map any input data to the detected fields.");
    }

    // Send all fields to be filled in a single message
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.tabs.sendMessage(tab.id, {
      type: 'fill_visual_form',
      data: { fields: fieldsToFill }
    });

    if (!result || !result.success) {
      throw new Error(result.error || "The content script failed to fill the form.");
    }
    
    chrome.runtime.sendMessage({
      type: 'visual_fill_complete',
      success: true,
      filledCount: result.filledCount,
      totalFields: fieldsToFill.length
    });
    
  } catch (error) {
    console.error('Error processing visual fields:', error);
    const friendlyError = formatApiError(error);
    const retryDelay = extractRetryDelay(error);
    chrome.runtime.sendMessage({
      type: 'visual_fill_complete',
      success: false,
      filledCount: 0,
      error: friendlyError + retryDelay
    });
  }
}
