// This script handles the "Find and Fill by Proximity" form filling logic.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'get_selected_text') {
    const selectedText = window.getSelection().toString();
    sendResponse({ selectedText: selectedText });
    return true;
  }

  if (request.type === 'get_form_fields') {
    try {
      const fields = findFormFields();
      sendResponse({ success: true, data: { fields } });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }

  if (request.type === 'fill_form_blindly') {
    const { fieldPairs } = request.data;
    fillFormByProximity(fieldPairs)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.type === 'force_capture_text') {
    forceCaptureText()
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function forceCaptureText() {
  console.log("Forcing 'selectAll' in main page and all iframes...");
  
  try {
    let allText = '';

    // Recursive function to select all text in a document and its sub-frames
    const selectAllInContext = (doc) => {
      if (!doc) return;
      
      try {
        // Focus the document body and execute selectAll
        doc.body.focus();
        const success = doc.execCommand('selectAll', false, null);
        if (success) {
          const selectedText = doc.getSelection().toString();
          if (selectedText) {
            allText += selectedText + '\n\n';
          }
        } else {
           console.warn("execCommand('selectAll') failed in a context.");
        }
      } catch (e) {
        console.warn(`Could not execute 'selectAll' in a context: ${e.message}`);
      }

      // Recurse into iframes
      const iframes = doc.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          selectAllInContext(iframeDoc);
        } catch (e) {
          console.warn(`Could not access iframe for 'selectAll': ${e.message}`);
        }
      });
    };

    // Start the process from the main document
    selectAllInContext(document);
    
    // Clear any lingering selections
    window.getSelection().removeAllRanges();

    const pageText = allText.trim();
    const fields = findFormFields();
    
    return {
      text: pageText,
      fields: fields
    };
    
  } catch (error) {
    console.error('Failed to capture page text:', error);
    throw error;
  }
}

async function fillFormByProximity(fieldPairs) {
  console.log('Starting blind form fill by coordinate proximity...');
  let filledCount = 0;
  let skippedFields = [];

  // Get all focusable elements once to avoid repeatedly querying the DOM.
  const focusableElements = getAllFocusableElements(document);
  console.log(`Found ${focusableElements.length} total focusable elements on the page.`);

  for (const pair of fieldPairs) {
    if (!pair.label || !pair.value) continue;

    // 1. Find the label text on the page
    window.getSelection().removeAllRanges();
    if (document.body) {
      document.body.focus();
      window.getSelection().collapse(document.body, 0);
    }
    const found = window.find(pair.label, false, false, true, false, true, false);

    if (found) {
      console.log(`Found label: "${pair.label}"`);
      
      // 2. Get the coordinates of the label's parent element
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
          ? range.commonAncestorContainer.parentElement 
          : range.commonAncestorContainer;
      
      if (!parentElement) {
        console.warn(`Could not find parent element for "${pair.label}"`);
        skippedFields.push({ label: pair.label, reason: 'Could not find parent element.' });
        continue;
      }

      const labelRect = parentElement.getBoundingClientRect();
      const labelCenter = {
        x: labelRect.left + labelRect.width / 2,
        y: labelRect.top + labelRect.height / 2
      };

      // 3. Find the closest focusable element to this label
      let closestElement = null;
      let minDistance = Infinity;

      focusableElements.forEach(el => {
        const elRect = el.getBoundingClientRect();
        if (elRect.width > 0 && elRect.height > 0) {
          const elCenter = { x: elRect.left + elRect.width / 2, y: elRect.top + elRect.height / 2 };
          const distance = Math.sqrt(Math.pow(labelCenter.x - elCenter.x, 2) + Math.pow(labelCenter.y - elCenter.y, 2));
          
          if (distance < minDistance) {
            minDistance = distance;
            closestElement = el;
          }
        }
      });

      // 4. Fill the closest element found
      if (closestElement) {
        console.log(`Closest input for "${pair.label}" is:`, closestElement);
        try {
          if (typeValue(closestElement, pair.value)) {
            filledCount++;
            console.log(`Filled value "${pair.value}" into closest field.`);
          } else if (selectOption(closestElement, pair.value)) {
            filledCount++;
            console.log(`Selected option "${pair.value}" in closest field.`);
          }
          else {
             console.warn(`Could not fill or select for "${pair.label}".`);
             skippedFields.push({ label: pair.label, reason: 'Action failed on element.' });
          }
        } catch (error) {
          console.error(`Error filling closest field for "${pair.label}":`, error);
          skippedFields.push({ label: pair.label, reason: `Error during fill: ${error.message}` });
        }
      } else {
        console.warn(`Could not find a proximate input field for "${pair.label}"`);
        skippedFields.push({ label: pair.label, reason: 'No proximate input found.' });
      }
    } else {
      console.warn(`Could not find label "${pair.label}" on the page.`);
      skippedFields.push({ label: pair.label, reason: 'Label not found on page' });
    }
  }

  return {
    success: filledCount > 0,
    filledCount: filledCount,
    totalFields: fieldPairs.length,
    skippedFields: skippedFields
  };
}

function getAllFocusableElements(doc) {
    let elements = [];
    try {
        const selector = 'input:not([type="hidden"]), textarea, select, kat-input, [role="combobox"]';
        const focusable = Array.from(doc.querySelectorAll(selector))
            .filter(el => !el.disabled && el.offsetParent !== null);
        elements = elements.concat(focusable);

        const iframes = doc.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                if (iframe.contentDocument) {
                    elements = elements.concat(getAllFocusableElements(iframe.contentDocument));
                }
            } catch (e) {
                console.warn('Could not access iframe content:', e.message);
            }
        });
    } catch (e) {
        console.error('Error getting focusable elements:', e.message);
    }
    return elements;
}

function typeValue(element, value) {
  try {
    element.focus();

    // Clear the field first by simulating 'select all' and 'delete'
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', keyCode: 46, bubbles: true }));
    
    // Fallback for clearing if the above doesn't work
    if (typeof element.value !== 'undefined') {
        element.value = '';
    }

    // Simulate typing each character
    for (const char of value) {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
      // For frameworks that listen to the input event
      if (typeof element.value !== 'undefined') {
        element.value += char;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    // Final change event
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (error) {
    console.error('Error simulating typing:', error);
    return false;
  }
}

// Function to find all visible form fields in the document and its iframes
function findFormFields() {
  let formFields = [];
  
  const findFieldsInContext = (context, isIframe = false) => {
    const selector = 'input:not([type="hidden"]), textarea, select, kat-input, [role="combobox"]';
    const inputs = context.querySelectorAll(selector);
    
    inputs.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        formFields.push({
          index: formFields.length,
          type: element.type || element.tagName.toLowerCase(),
          placeholder: element.placeholder || '',
          ariaLabel: element.getAttribute('aria-label') || '',
          context: getFieldContext(element),
          isIframe: isIframe
        });
      }
    });

    const iframes = context.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          findFieldsInContext(iframeDoc, true);
        }
      } catch (e) {
        // Ignore cross-origin iframes
      }
    });
  };

  findFieldsInContext(document);
  console.log(`Found ${formFields.length} visible form fields across all frames.`);
  return formFields;
}

// Function to get surrounding text context for a field
function getFieldContext(element) {
  let context = '';
  const label = findAssociatedLabel(element);
  if (label) {
    context += label.innerText.trim() + ' ';
  }
  return context.trim();
}

// Function to find a label associated with a form element
function findAssociatedLabel(element) {
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label;
  }
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName === 'LABEL') return parent;
    parent = parent.parentElement;
  }
  return null;
}

// Function to select an option in a dropdown/select element
function selectOption(selectElement, value) {
  try {
    selectElement.focus();
    
    // Try to find an option that matches the value (case-insensitive)
    const options = Array.from(selectElement.options);
    const valueLower = value.toLowerCase().trim();
    
    // First, try exact match
    let matchedOption = options.find(opt => 
      opt.value.toLowerCase() === valueLower || 
      opt.text.toLowerCase() === valueLower
    );
    
    // If no exact match, try partial match
    if (!matchedOption) {
      matchedOption = options.find(opt => 
        opt.value.toLowerCase().includes(valueLower) || 
        opt.text.toLowerCase().includes(valueLower)
      );
    }
    
    // If still no match, try to find if value contains option text
    if (!matchedOption) {
      matchedOption = options.find(opt => 
        valueLower.includes(opt.value.toLowerCase()) || 
        valueLower.includes(opt.text.toLowerCase())
      );
    }
    
    if (matchedOption) {
      selectElement.value = matchedOption.value;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } else {
      console.warn(`No matching option found for value "${value}" in dropdown`);
      return false;
    }
  } catch (error) {
    console.error('Error selecting option:', error);
    return false;
  }
}

console.log('Proximity-based form filler script initialized.');
