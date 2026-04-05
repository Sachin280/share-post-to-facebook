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
  throw lastError || new Error('API request failed after multiple retries.');
}

// Process text selection with AI for the "Find, Tab, Paste" method
export async function processTextSelectionWithAI(pageText, fields, inputData, tabId, extraPrompt) {
  try {
    // First check if we have an API key
    let apiKey;
    try {
      apiKey = await getApiKey();
    } catch (error) {
      console.error('API Key error:', error);
      chrome.runtime.sendMessage({
        type: 'text_selection_error',
        error: 'API Key not found. Please set it in the extension settings.'
      });
      return;
    }

    const VERCEL_API_URL = 'https://inventabot-proxy-backend.vercel.app/api/fill';
    
    console.log('Processing text selection with AI via Vercel proxy...');
    chrome.runtime.sendMessage({ type: 'text_processing' });
    
    const prompt = `You are a highly specialized data extraction AI. Your sole purpose is to identify form field labels from a block of text and pair them with the user's provided data.

**Rules:**
1.  **Analyze the User Input:** Understand the data provided by the user (e.g., name, address, phone number).
2.  **Analyze the Page Text:** Scan the text to find labels that correspond to the user's data.
3.  **CRITICAL RULE: Do NOT extract titles, headings, or instructions.** You must differentiate between a heading like "Enter Customer Address" and an actual field label like "Street Address". Only extract the specific label for an input field.
4.  **Match Labels Exactly:** The "label" in your JSON output must be an exact, character-for-character match of the label text found on the page.
5.  **Output Format:** Your entire response must be ONLY a single JSON array of objects, where each object has a "label" and a "value". Do not include any other text, explanations, or markdown.

**User Input:**
"${inputData}"

${extraPrompt ? `**Special Instructions:**
"${extraPrompt}"` : ''}

**Full Page Text (for context):**
"${pageText}"

**Example Scenario:**
- **User Input:** "John Smith, 123 Apple Lane, john@email.com"
- **Page Text:** "...some text... Please Enter Your Information ... Full Name: ... Street Address: ... Email: ... some other text..."
- **Correct JSON Output:**
[
  { "label": "Full Name:", "value": "John Smith" },
  { "label": "Street Address:", "value": "123 Apple Lane" },
  { "label": "Email:", "value": "john@email.com" }
]

Now, based on the provided User Input and Full Page Text, generate the JSON array.`;

    const requestBody = {
      pageText: pageText,
      inputData: inputData,
      geminiApiKey: apiKey,
      extraPrompt: extraPrompt
    };

    const response = await fetchWithRetry(VERCEL_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const fieldPairs = await response.json();

    console.log('AI generated field pairs:', fieldPairs);
    chrome.runtime.sendMessage({ type: 'filling_fields' });

    // Send the pairs to the content script for the "Find, Tab, Paste" routine
    const result = await chrome.tabs.sendMessage(tabId, {
      type: 'fill_form_blindly',
      data: { fieldPairs: fieldPairs }
    });

    chrome.runtime.sendMessage({
      type: 'text_fill_complete',
      success: result.success,
      filledCount: result.filledCount,
      totalFields: result.totalFields,
      error: result.error,
      skippedFields: result.skippedFields
    });
    
  } catch (error) {
    console.error('Error processing text selection for blind fill:', error);
    const friendlyError = formatApiError(error);
    const retryDelay = extractRetryDelay(error);
    chrome.runtime.sendMessage({
      type: 'text_selection_error',
      error: friendlyError + retryDelay
    });
  }
}
