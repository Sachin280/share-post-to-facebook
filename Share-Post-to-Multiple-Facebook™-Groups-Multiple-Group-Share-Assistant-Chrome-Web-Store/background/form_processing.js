import { processFormWithAI } from './api.js';

export async function processFieldsWithSinglePrompt(inputData, forms, extraPrompt) {
  try {
    if (!forms || forms.length === 0) {
      throw new Error("No forms found by content script.");
    }
    
    console.log('Starting AI processing via proxy...');
    
    // The complex logic is now on the server. We just send the data.
    const mapping = await processFormWithAI(inputData, forms, extraPrompt);
    
    console.log('API response received from proxy:', mapping);

    let allFields = [];
    forms.forEach((form) => {
        allFields = allFields.concat(form.fields);
    });

    const fieldData = [];
    for (const [fieldId, value] of Object.entries(mapping)) {
        const field = allFields.find(f => f.id === fieldId);
        if (field) {
            fieldData.push({
                fieldId: field.id,
                selector: field.selector,
                value: value
            });
        }
    }
    
    if (fieldData.length === 0) {
      throw new Error("AI did not return any fields to fill.");
    }

    console.log('Parsed field data, sending to content script:', fieldData);
    chrome.runtime.sendMessage({ type: 'filling_fields' });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'fill_specific_fields', data: { fieldData } });

    if (!result || !result.success) {
      throw new Error(result.error || "Content script failed to fill fields.");
    }

    // If we reach here, it means success.
    chrome.runtime.sendMessage({ 
        type: 'form_filled', 
        success: true,
        filledCount: result.filledCount,
        totalFields: result.totalFields
    });
    
  } catch (error) {
    console.error('Error in processFieldsWithSinglePrompt:', error);
    
    chrome.runtime.sendMessage({
      type: 'form_filled',
      success: false,
      error: `AI processing failed: ${error.message}`
    });
  }
}

export function attemptFallbackExtraction(inputData, formFields) {
  const fieldData = [];
  
  // Simple regex patterns for common data
  const patterns = {
    email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/,
    phone: /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/,
    zipcode: /\b(\d{5})\b/,
    name: /([A-Z][a-z]+\s+[A-Z][a-z]+)/
  };
  
  formFields.forEach((field, index) => {
    let value = '';
    const fieldType = field.type.toLowerCase();
    const fieldName = (field.name + field.label + field.placeholder).toLowerCase();
    
    if (fieldName.includes('email') && patterns.email.test(inputData)) {
      value = inputData.match(patterns.email)[1];
    } else if (fieldName.includes('phone') && patterns.phone.test(inputData)) {
      value = inputData.match(patterns.phone)[1];
    } else if (fieldName.includes('zip') && patterns.zipcode.test(inputData)) {
      value = inputData.match(patterns.zipcode)[1];
    } else if (fieldName.includes('name') && patterns.name.test(inputData)) {
      const nameMatch = inputData.match(patterns.name)[1];
      if (fieldName.includes('first')) {
        value = nameMatch.split(' ')[0];
      } else if (fieldName.includes('last')) {
        value = nameMatch.split(' ')[1];
      } else {
        value = nameMatch;
      }
    }
    
    if (value) {
      fieldData.push({
          fieldId: field.id,
          selector: field.selector,
          value: value
        });
    }
  });
  
  return fieldData;
}
