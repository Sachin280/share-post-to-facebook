// This script handles the specialized form filling for Amazon FBA pages with Shadow DOM.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fill_amazon_fba_form') {
    console.log('Starting Amazon FBA form fill...');
    // Note: We now receive inputData here as well.
    fillForm(request.data.fieldPairs, request.data.inputData)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates asynchronous response.
  }
});

async function fillForm(fieldPairs, inputData) {
  let filledCount = 0;
  let skippedFields = [];

  for (const pair of fieldPairs) {
    if (!pair.label || !pair.value) continue;

    // 1. Find the label text on the page.
    window.getSelection().removeAllRanges();
    if (document.body) {
      document.body.focus();
      window.getSelection().collapse(document.body, 0);
    }
    const found = window.find(pair.label, false, false, true, false, true, false);

    if (!found) {
      console.warn(`Could not find label: "${pair.label}"`);
      skippedFields.push({ label: pair.label, reason: 'Label not found' });
      continue;
    }
    
    console.log(`Found label: "${pair.label}"`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for selection to be stable.

    // 2. Find the input field.
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
        skippedFields.push({ label: pair.label, reason: 'Selection lost after find' });
        continue;
    }
    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
        ? range.commonAncestorContainer.parentElement 
        : range.commonAncestorContainer;

    if (!parentElement) {
        skippedFields.push({ label: pair.label, reason: 'Could not find parent element' });
        continue;
    }

    let container = parentElement;
    let inputElement = null;
    let dropdownElement = null;
    let standardInputElement = null;

    while(container && container.tagName !== 'BODY') {
        inputElement = container.querySelector('kat-input');
        dropdownElement = container.querySelector('kat-dropdown');
        // As a fallback, check for standard inputs, being careful not to select buttons.
        standardInputElement = container.querySelector('input[type="text"], input:not([type]), textarea');
        if (inputElement || dropdownElement || standardInputElement) break;
        container = container.parentElement;
    }

    if (inputElement && inputElement.shadowRoot) {
        const shadowInput = inputElement.shadowRoot.querySelector('input[part="input"]');
        if (shadowInput) {
            if (shadowInput.id === 'katal-id-10') {
                console.log('Skipping blacklisted search field.');
                skippedFields.push({ label: pair.label, reason: 'Field is blacklisted.' });
                continue;
            }
            // Click the component itself to focus it
            inputElement.click();
            await new Promise(resolve => setTimeout(resolve, 50));

            typeValue(shadowInput, pair.value);
            filledCount++;

            // Click away to trigger any blur/change events on the component
            document.body.click();
            await new Promise(resolve => setTimeout(resolve, 100));
        } else {
            skippedFields.push({ label: pair.label, reason: 'Could not find input in Shadow DOM' });
        }
    } else if (dropdownElement) {
        const success = await selectKatOption(dropdownElement, pair.value);
        if (success) {
            filledCount++;
        } else {
            skippedFields.push({ label: pair.label, reason: 'Could not select dropdown option' });
        }
    } else if (standardInputElement) {
        console.log(`Found standard input for label: "${pair.label}"`);
        standardInputElement.click();
        await new Promise(resolve => setTimeout(resolve, 50));
        typeValue(standardInputElement, pair.value);
        filledCount++;
        document.body.click(); // Click away to trigger blur
        await new Promise(resolve => setTimeout(resolve, 100));
    } else {
        skippedFields.push({ label: pair.label, reason: 'Could not find kat-input, kat-dropdown, or standard input element' });
    }
  }

  // FINALIZATION LOOPHOLE
  // After filling the form with our specialized script, we now trigger the
  // standard form-filling logic. This standard logic will fail, but the
  // attempt itself will cause the framework to register the values we just set.
  console.log('FBA fill complete. Triggering standard fill process as a finalization step...');
  chrome.runtime.sendMessage({
    type: 'trigger_fba_finalization',
    data: { inputData }
  });

  return { success: true, filledCount, skippedFields };
}

function typeValue(element, value) {
  try {
    element.focus();
    element.click();
    element.value = ''; // Clear the field before typing.

    // More robustly simulate typing each character.
    for (const char of value) {
      // Dispatch keydown and keyup events for each character.
      element.dispatchEvent(new KeyboardEvent('keydown', { key: char, code: `Key${char.toUpperCase()}`, charCode: char.charCodeAt(0), keyCode: char.charCodeAt(0), which: char.charCodeAt(0), bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keyup', { key: char, code: `Key${char.toUpperCase()}`, charCode: char.charCodeAt(0), keyCode: char.charCodeAt(0), which: char.charCodeAt(0), bubbles: true }));
      
      // Update the value and dispatch an input event.
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    }

    // Dispatch change and blur events after typing is complete.
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    
    console.log(`Successfully typed "${value}" into element.`);
    return true;
  } catch (error) {
    console.error('Error in typeValue function:', error);
    return false;
  }
}

async function selectKatOption(katDropdown, value) {
  try {
    // 1. Click the dropdown to open it.
    katDropdown.click();

    // 2. Wait for the options to appear.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    // 3. Get the options from the dropdown. They might be in the main DOM or a shadow DOM.
    let options = [];
    const foundOptions = document.querySelectorAll('kat-option');
    if (foundOptions.length > 0) {
        console.log(`Found ${foundOptions.length} options in the main document.`);
        options = Array.from(foundOptions).map(opt => ({
            name: opt.textContent.trim(),
            value: opt.getAttribute('value')
        }));
    } else if (katDropdown.shadowRoot) {
        const shadowOptions = katDropdown.shadowRoot.querySelectorAll('kat-option');
        if(shadowOptions.length > 0) {
            console.log(`Found ${shadowOptions.length} options in the shadow DOM.`);
            options = Array.from(shadowOptions).map(opt => ({
                name: opt.textContent.trim(),
                value: opt.getAttribute('value')
            }));
        }
    }

    if (options.length === 0) {
        console.error('Could not find any options in the dropdown.');
        return false;
    }

    // 4. Ask the AI to choose the best option.
    console.log('Asking AI to choose the best option...');
    const bestOption = await findBestOption(options, value);

    if (bestOption && bestOption.value) {
        console.log('AI chose:', bestOption);
        // 5. Show the user what was chosen and then set the value.
        await showTemporaryAlert(`Chosen State: ${bestOption.name} (${bestOption.value})`);
        katDropdown.setAttribute('value', bestOption.value);
        katDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    console.error('AI failed to return a valid option.');
    await showTemporaryAlert('AI could not determine the correct state.');
    return false;
  } catch (error) {
    console.error('Error selecting kat-option:', error);
    return false;
  }
}

async function findBestOption(options, value) {
    const response = await chrome.runtime.sendMessage({
        type: 'find_best_dropdown_option',
        data: { options, value }
    });
    return response.bestOption;
}

function showTemporaryAlert(message) {
  return new Promise(resolve => {
    const alertBox = document.createElement('div');
    alertBox.textContent = message;
    alertBox.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 15px 25px;
      background-color: #4CAF50;
      color: white;
      border-radius: 8px;
      z-index: 99999;
      font-size: 16px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      transition: opacity 0.5s;
    `;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.style.opacity = '0';
      setTimeout(() => {
        alertBox.remove();
        resolve();
      }, 500);
    }, 2000);
  });
}
