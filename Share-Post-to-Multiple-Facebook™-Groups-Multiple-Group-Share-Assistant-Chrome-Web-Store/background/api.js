// [MODIFIED FOR PERSONAL USE - Developer Mode]
// Helper to get Gemini API key (offline mode - uses mock key)
export function getApiKey() {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if API key is stored locally
      chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
          console.log('Using stored Gemini API key (offline mode)');
          resolve(result.geminiApiKey);
        } else {
          // Return a mock API key for offline mode
          console.log('No stored API key available - extension working in offline mode');
          reject(new Error('API key not available in offline mode. Please configure geminiApiKey in storage.'));
        }
      });
    } catch (error) {
      reject(new Error('Failed to access API service: ' + error.message));
    }
  });
}

const FILL_API_URL = 'https://inventabot-proxy-backend.vercel.app/api/fill';

async function callFillApi(pageText, inputData, formType, extraPrompt) {
    const geminiApiKey = await getApiKey();
    
    const response = await fetch(FILL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pageText,
            inputData,
            formType,
            geminiApiKey,
            extraPrompt
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}

export async function generatePostVariations(prompt, count, geminiApiKey, customSystemPrompt = null) {
  // Always fetch the Vercel API key
  try {
    geminiApiKey = await getApiKey();
  } catch (e) {
    throw new Error(e.message || 'Failed to access API service.');
  }

  const baseInstruction = customSystemPrompt || "You are a social media assistant. Generate distinct variations of a Facebook post based on the user's prompt.";
  
  const systemPrompt = `${baseInstruction}
  
  Task: Generate ${count} distinct variations.
  Format: Return ONLY a raw JSON array of strings. Do not include markdown formatting (no \`\`\`json or \`\`\`).
  Example output: ["Variation 1 content", "Variation 2 content"]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: systemPrompt + "\n\nUser Prompt: " + prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  try {
    const text = data.candidates[0].content.parts[0].text;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('Failed to parse Gemini response:', data);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

export function getFieldPairsFromAI(pageText, inputData, extraPrompt) {
    return callFillApi(pageText, inputData, 'general', extraPrompt);
}

export function getFbaFieldPairsFromAI(pageText, inputData, extraPrompt) {
    return callFillApi(pageText, inputData, 'fba', extraPrompt);
}

const PROCESS_API_URL = 'https://inventabot-proxy-backend.vercel.app/api/process';

export async function processFormWithAI(inputData, forms, extraPrompt) {
    const geminiApiKey = await getApiKey();
    
    const response = await fetch(PROCESS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            inputData,
            forms,
            geminiApiKey,
            extraPrompt
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}
