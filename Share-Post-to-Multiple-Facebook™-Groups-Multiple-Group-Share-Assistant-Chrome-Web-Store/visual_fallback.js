// This script will be injected to perform visual-based form filling.

console.log('Visual Fallback script loaded.');

// Function to simulate a click at a specific coordinate
function clickAt(x, y) {
  const element = document.elementFromPoint(x, y);
  if (element) {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y
    });
    element.dispatchEvent(clickEvent);
    return element;
  }
  return null;
}

// Function to type text into the currently focused element
function typeText(element, text) {
  try {
    if (!element || typeof element.focus !== 'function') {
      throw new Error('Cannot type, invalid element provided.');
    }
    element.focus();
    
    // A more robust way to set value for modern frameworks
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(element, text);

    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
  } catch (e) {
    const errorMsg = `Failed to set value for element. It might be a dropdown or other non-text input.`;
    console.warn(errorMsg, e.message);
    throw new Error(errorMsg);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fill_visual_form') {
    console.log('Received visual fill request:', request.data);
    const { fields } = request.data; // Expects an array of { x, y, value }

    (async () => {
      let filledCount = 0;
      for (const field of fields) {
        const clickedElement = clickAt(field.x, field.y);
        if (clickedElement) {
          try {
            // Small delay to ensure focus is set before typing
            await new Promise(resolve => setTimeout(resolve, 100));
            typeText(clickedElement, field.value);
            filledCount++;
          } catch (error) {
            console.warn(`Skipping field at (${field.x}, ${field.y}) because it could not be filled. Error: ${error.message}`);
            // Continue to the next field
          }
        }
      }
      
      // Notify background script of completion
      sendResponse({ success: true, filledCount });
    })();

    return true; // Indicates an asynchronous response
  }
});
