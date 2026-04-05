import { getApiKey } from './api.js';

export async function findBestDropdownOption(options, value) {
    const apiKey = await getApiKey();
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `You are an expert at matching user input to dropdown options. From the following list of options, choose the one that best matches the user's input.

**Options:**
${JSON.stringify(options, null, 2)}

**User Input:**
"${value}"

Return ONLY the JSON object for the best matching option. For example:
{ "name": "California", "value": "CA" }`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid API response structure');
    }
    
    const content = data.candidates[0].content.parts[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }
    return JSON.parse(jsonMatch[0]);
}
