import { getApiKey } from './api.js';
import { formatApiError, extractRetryDelay } from './error_formatter.js';

// This file will contain the logic for interacting with the Gemini "Computer Use" API.
// We will build out the agent loop and API call functions here.

// Screen dimensions will be determined dynamically based on the actual viewport
let SCREEN_WIDTH = 1440;
let SCREEN_HEIGHT = 900;

async function callGeminiComputerUseAPI(apiKey, contents, signal) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-computer-use-preview-10-2025:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: contents,
    tools: [
      {
        computer_use: {
          environment: "ENVIRONMENT_BROWSER"
        }
      }
    ]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal // Pass the abort signal to the fetch request
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}

export async function startMouseControlFill(inputData, extraPrompt) {
  console.log('Starting Mouse Control Fill process...');
  const abortController = new AbortController();
  let contents = []; // This will hold the entire conversation history
  let isCancelled = false;
  let tabId = null;

  const cleanup = async () => {
    if (tabId) {
      // Remove the message listener
      chrome.runtime.onMessage.removeListener(cancelListener);
      // Execute cleanup script on the page
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            const btn = document.getElementById('mouse-control-cancel-btn');
            if (btn) btn.remove();
            if (typeof removeVirtualCursor === 'function') {
              removeVirtualCursor();
            }
          }
        });
      } catch (e) {
        console.error('Error during cleanup script execution:', e);
      }
    }
  };

  const cancelListener = (message) => {
    if (message.type === 'cancel_mouse_control') {
      isCancelled = true;
      console.log('Mouse control cancelled by user, aborting API call.');
      abortController.abort(); // Abort the fetch request immediately
    }
  };

  try {
    chrome.runtime.sendMessage({ type: 'error', message: 'Initializing Mouse Control...' });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error("No active tab found.");
    tabId = tab.id; // Store tabId for cleanup

    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("API key not found.");

    // Inject cancel button into the page
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Remove any existing cancel button
        const existing = document.getElementById('mouse-control-cancel-btn');
        if (existing) existing.remove();
        
        // Create cancel button
        const cancelBtn = document.createElement('div');
        cancelBtn.id = 'mouse-control-cancel-btn';
        cancelBtn.innerHTML = `
          <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 999999; 
                      background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); 
                      color: white; padding: 5px 10px; border-radius: 8px; 
                      box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer; 
                      font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;
                      display: flex; align-items: center; gap: 10px;
                      transition: all 0.3s ease;
                      border: 2px solid rgba(255,255,255,0.3);">
            <span>Cancel</span>
          </div>
        `;
        
        // Add hover effect
        const btn = cancelBtn.firstElementChild;
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'scale(1.05)';
          btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'scale(1)';
          btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });
        
        // Add click handler to send cancellation message
        btn.addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: 'cancel_mouse_control' });
          btn.innerHTML = '<span style="font-size: 20px;">✓</span><span>CANCELLING...</span>';
          btn.style.background = 'linear-gradient(135deg, #666 0%, #333 100%)';
          btn.style.cursor = 'default';
        });
        
        document.body.appendChild(cancelBtn);
      }
    });

    // Set up listener for cancel message
    chrome.runtime.onMessage.addListener(cancelListener);

    chrome.runtime.sendMessage({ type: 'error', message: 'Injecting executor script...' });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['mouse_control_executor.js']
    });

    // Show the cursor at the center immediately
    await chrome.tabs.sendMessage(tab.id, { type: 'show_cursor' });

    chrome.runtime.sendMessage({ type: 'error', message: 'Capturing initial screenshot...' });
    
    // Get the actual viewport dimensions
    const dimensions = await chrome.tabs.sendMessage(tab.id, { type: 'get_viewport_dimensions' });
    if (dimensions && dimensions.width && dimensions.height) {
      SCREEN_WIDTH = dimensions.width;
      SCREEN_HEIGHT = dimensions.height;
      console.log(`Using viewport dimensions: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}`);
    }
    
    // Initial prompt and screenshot
    const initialScreenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    const initialPrompt = `You are an AI assistant helping a user fill a form. The user's data is: "${inputData}". ${extraPrompt ? `Special instructions: "${extraPrompt}".` : ''}

IMPORTANT INSTRUCTIONS FOR SPEED:
- You can return MULTIPLE actions in a SINGLE response using parallel function calling
- For simple, visible forms: Return ALL form field actions at once (e.g., type in field 1, type in field 2, type in field 3, click submit)
- Only use single actions for complex interactions like: dropdowns that need to be opened first, multi-step processes, or when you need to see the result of an action before proceeding
- Batch as many independent actions together as possible to minimize screenshot cycles

Analyze the screenshot and determine the actions needed to fill the form. When the form is completely filled, your final response should be just the word "DONE".`;
    
    contents.push({
      role: "user",
      parts: [
        { text: initialPrompt },
        { inline_data: { mime_type: 'image/png', data: initialScreenshot.split(',')[1] } }
      ]
    });

    chrome.runtime.sendMessage({ type: 'error', message: 'Starting agent loop...' });

    // Agent loop - continue until the model says it's done or we hit a safety limit
    for (let i = 0; i < 20; i++) {
      // Check if cancelled
      if (isCancelled) {
        console.log('Mouse control cancelled by user at iteration', i + 1);
        throw new Error('Operation cancelled by user');
      }
      
      console.log(`Agent loop iteration ${i + 1}`);
      chrome.runtime.sendMessage({ type: 'error', message: `Processing step ${i + 1}...` });
      
      const result = await callGeminiComputerUseAPI(apiKey, contents, abortController.signal);
      
      console.log('Gemini API response:', JSON.stringify(result, null, 2));

      if (!result.candidates || !result.candidates[0].content) {
        throw new Error("Invalid response from Gemini API.");
      }

      const modelResponse = result.candidates[0].content;
      contents.push(modelResponse);

      const functionCalls = modelResponse.parts.filter(part => part.functionCall);
      console.log(`Found ${functionCalls.length} function calls`);

      if (functionCalls.length > 0) {
        const functionResponses = [];
        for (const part of functionCalls) {
          const functionCall = part.functionCall;
          console.log('Executing function:', functionCall.name, functionCall.args);
          chrome.runtime.sendMessage({ type: 'error', message: `Executing: ${functionCall.name}` });
          
          const action = { action: functionCall.name, args: { ...functionCall.args } };

          // Clamp and denormalize coordinates
          if (action.args.x !== undefined) {
            // Clamp to valid range [0, 1000)
            const clampedX = Math.max(0, Math.min(999, action.args.x));
            action.args.x = Math.round(clampedX / 1000 * SCREEN_WIDTH);
          }
          if (action.args.y !== undefined) {
            // Clamp to valid range [0, 1000)
            const clampedY = Math.max(0, Math.min(999, action.args.y));
            action.args.y = Math.round(clampedY / 1000 * SCREEN_HEIGHT);
          }

          console.log('Denormalized action:', action);

          // Check if the action is a click within the "safe zone" of the cancel button
          const isClickInSafeZone = (action.action === 'click_at' || action.action === 'type_text_at') &&
                                    action.args.y < 60 && // Top 60 pixels
                                    action.args.x > (SCREEN_WIDTH / 2 - 150) && // Center area
                                    action.args.x < (SCREEN_WIDTH / 2 + 150);

          if (isClickInSafeZone) {
            console.log('Click is in safe zone, temporarily hiding cancel button.');
            await chrome.tabs.sendMessage(tab.id, { type: 'toggle_cancel_button', visible: false });
          }

          const execResponse = await chrome.tabs.sendMessage(tab.id, { type: 'execute_ui_action', action });
          console.log('Execution response:', execResponse);

          if (isClickInSafeZone) {
            console.log('Re-showing cancel button.');
            await chrome.tabs.sendMessage(tab.id, { type: 'toggle_cancel_button', visible: true });
          }
          
          if (!execResponse.success) {
            throw new Error(`Failed to execute action: ${execResponse.error}`);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));

        const newScreenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        
        // Get current URL
        const currentUrl = tab.url;
        
        for (const part of functionCalls) {
            functionResponses.push({
                function_response: {
                    name: part.functionCall.name,
                    response: {
                        url: currentUrl
                    },
                    parts: [{
                        inline_data: {
                            mime_type: 'image/png',
                            data: newScreenshot.split(',')[1]
                        }
                    }]
                }
            });
        }
        
        contents.push({ role: "user", parts: functionResponses });

      } else {
        const textResponse = modelResponse.parts.find(part => part.text)?.text;
        console.log('Model text response:', textResponse);
        console.log('Full model response parts:', JSON.stringify(modelResponse.parts, null, 2));
        chrome.runtime.sendMessage({ type: 'error', message: `Model response: ${JSON.stringify(modelResponse.parts)}` });
        
        if (textResponse && textResponse.trim().toUpperCase().includes("DONE")) {
          console.log("Form filling complete.");
          chrome.runtime.sendMessage({ type: 'form_filled', success: true, filledCount: 'N/A', totalFields: 'N/A', source: 'mouse_control' });
          return; // Exit the loop and function
        }
        // If we get here, the model returned something unexpected
        throw new Error(`Unexpected model response. Parts: ${JSON.stringify(modelResponse.parts)}`);
      }
    }
    console.log("Agent loop completed without explicit DONE signal.");
    chrome.runtime.sendMessage({ type: 'form_filled', success: true, filledCount: 'N/A', totalFields: 'N/A', source: 'mouse_control' });

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted as requested by user.');
      // Create a user-friendly error message for cancellation
      error = new Error('Operation cancelled by user');
    }
    console.error('Mouse Control Fill failed:', error);
    const friendlyError = formatApiError(error);
    const retryDelay = extractRetryDelay(error);
    chrome.runtime.sendMessage({
      type: 'form_filled',
      success: false,
      error: friendlyError + retryDelay,
      source: 'mouse_control'
    });
  } finally {
    // This block will run regardless of success, error, or cancellation
    await cleanup();
  }
}
