// This script will be injected into the webpage to execute UI actions.

console.log('Mouse Control Executor script loaded (v3 - with animated cursor).');

// Persistent mouse cursor
let virtualCursor = null;

function createVirtualCursor() {
    if (!virtualCursor) {
        virtualCursor = document.createElement('div');
        virtualCursor.innerHTML = '⬆️';
        virtualCursor.style.position = 'fixed';
        virtualCursor.style.fontSize = '24px'; // Start at normal size
        virtualCursor.style.zIndex = '9999999';
        virtualCursor.style.pointerEvents = 'none';
        virtualCursor.style.transition = 'left 1s ease-in-out, top 1s ease-in-out';
        virtualCursor.style.opacity = '0.7'; // 70% opacity to not cover elements
        // Center the cursor initially
        virtualCursor.style.left = `${window.innerWidth / 2}px`;
        virtualCursor.style.top = `${window.innerHeight / 2}px`;
        virtualCursor.style.transform = 'translate(-50%, -50%)'; // Adjust for exact centering
        virtualCursor.style.filter = 'drop-shadow(0 0 3px rgba(0,0,0,0.8))';
        document.body.appendChild(virtualCursor);
    }
    return virtualCursor;
}

function moveVirtualCursor(x, y) {
    const cursor = createVirtualCursor();
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y + 20}px`; // Offset 20px down to avoid covering elements
}

function removeVirtualCursor() {
    if (virtualCursor) {
        virtualCursor.remove();
        virtualCursor = null;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'get_viewport_dimensions') {
    // Return the actual viewport dimensions
    sendResponse({
      width: window.innerWidth,
      height: window.innerHeight
    });
    return true;
  }

  if (request.type === 'show_cursor') {
    // Show the cursor at the center of the screen immediately
    createVirtualCursor();
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'toggle_cancel_button') {
    const btn = document.getElementById('mouse-control-cancel-btn');
    if (btn) {
      btn.style.display = request.visible ? 'block' : 'none';
    }
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'execute_ui_action') {
    console.log('Executing UI action:', request.action);
    const { action, args } = request.action;

    (async () => {
      try {
        switch (action) {
          case 'click_at':
            await simulateClick(args.x, args.y);
            break;
          case 'type_text_at':
            await simulateTypeText(args.x, args.y, args.text, args.press_enter);
            break;
          case 'scroll_document':
            await simulateScrollDocument(args.direction);
            break;
          case 'scroll_at':
            await simulateScrollAt(args.x, args.y, args.direction, args.magnitude);
            break;
          default:
            console.warn('Unknown UI action:', action);
        }
        sendResponse({ success: true });
      } catch (error) {
        console.error('Failed to execute UI action:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    
    return true; // Keep the message channel open for async response
  }
});

function findElement(x, y) {
    let element = document.elementFromPoint(x, y);
    
    // If the element is an iframe, we need to look inside it
    if (element && element.tagName === 'IFRAME') {
        try {
            const iframeDoc = element.contentDocument || element.contentWindow.document;
            const rect = element.getBoundingClientRect();
            // Calculate coordinates relative to the iframe
            const iframeX = x - rect.left;
            const iframeY = y - rect.top;
            // Find element inside the iframe
            const elementInIframe = iframeDoc.elementFromPoint(iframeX, iframeY);
            if (elementInIframe) {
                element = elementInIframe;
            }
        } catch (e) {
            console.error('Cannot access iframe content (cross-origin?):', e);
        }
    }
    
    // If the element is a label, try to find its associated input field
    if (element && element.tagName === 'LABEL') {
        if (element.htmlFor) {
            const inputElement = document.getElementById(element.htmlFor);
            if (inputElement) {
                return inputElement;
            }
        }
        // If label doesn't have htmlFor, try to find input within the label
        const inputInLabel = element.querySelector('input, textarea, [contenteditable="true"]');
        if (inputInLabel) {
            return inputInLabel;
        }
    }
    
    return element;
}

function showClickEffect(x, y) {
    const clickRing = document.createElement('div');
    clickRing.style.position = 'fixed';
    clickRing.style.left = `${x - 15}px`;
    clickRing.style.top = `${y - 15}px`;
    clickRing.style.width = '30px';
    clickRing.style.height = '30px';
    clickRing.style.borderRadius = '50%';
    clickRing.style.border = '3px solid #00ff00';
    clickRing.style.zIndex = '9999998';
    clickRing.style.pointerEvents = 'none';
    clickRing.style.animation = 'clickPulse 0.6s ease-out';
    
    const style = document.createElement('style');
    style.id = 'click-pulse-style';
    if (!document.getElementById('click-pulse-style')) {
        style.textContent = `
            @keyframes clickPulse {
                0% { transform: scale(0.5); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(clickRing);
    
    setTimeout(() => {
        clickRing.remove();
    }, 600);
}

async function simulateClick(x, y) {
  moveVirtualCursor(x, y);
  
  // Wait for cursor to move (optimized for speed)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Change to clicking cursor
  if (virtualCursor) virtualCursor.innerHTML = '👆';
  
  showClickEffect(x, y);
  
  const element = findElement(x, y);
  if (element) {
    console.log('Clicking element:', element);
    console.log('Element tagName:', element.tagName);
    console.log('Element class:', element.className);
    console.log('Element id:', element.id);
    console.log('Element computed style pointer-events:', window.getComputedStyle(element).pointerEvents);
    
    // More robust click simulation with multiple event types
    const dispatchMouseEvent = (type) => {
        const event = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: x,
            clientY: y,
            screenX: x,
            screenY: y,
            button: 0 // Main button
        });
        console.log(`Dispatching ${type} event on`, element);
        element.dispatchEvent(event);
    };

    // Try to focus the element first (important for some dropdowns)
    try {
        if (typeof element.focus === 'function') {
            element.focus();
        }
    } catch (e) {
        console.log('Could not focus element:', e);
    }

    // Dispatch full sequence of mouse events
    dispatchMouseEvent('mouseover');
    await new Promise(resolve => setTimeout(resolve, 20));
    dispatchMouseEvent('mouseenter');
    await new Promise(resolve => setTimeout(resolve, 20));
    dispatchMouseEvent('mousedown');
    await new Promise(resolve => setTimeout(resolve, 20));
    dispatchMouseEvent('mouseup');
    await new Promise(resolve => setTimeout(resolve, 20));
    dispatchMouseEvent('click');
    
    // Also try the native click as a final fallback
    try {
        element.click();
    } catch (e) {
        console.log('Native click failed:', e);
    }
    
  } else {
    throw new Error(`No element found at coordinates: (${x}, ${y})`);
  }
  
  // Wait to show the click (optimized for speed)
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Change back to normal cursor
  if (virtualCursor) virtualCursor.innerHTML = '⬆️';
}

async function simulateTypeText(x, y, text, pressEnter) {
    console.log(`Attempting to type at (${x}, ${y}), text: "${text}"`);
    moveVirtualCursor(x, y);
    
    // Wait for cursor to move (optimized for speed)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Change to clicking cursor
    if (virtualCursor) virtualCursor.innerHTML = '👆';
    
    // Wait to show the click (optimized for speed)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Change back to normal cursor
    if (virtualCursor) virtualCursor.innerHTML = '⬆️';
    
    const element = findElement(x, y);
    console.log('Found element:', element);
    console.log('Element tagName:', element?.tagName);
    console.log('Element isContentEditable:', element?.isContentEditable);
    
    if (element) {
        // Check if the element is an input, textarea, or contenteditable
        const isInputElement = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
        const isContentEditable = element.isContentEditable;
        
        console.log('isInputElement:', isInputElement, 'isContentEditable:', isContentEditable);

        if (isInputElement || isContentEditable) {
            element.focus();

            // Clear the field before typing
            if (isInputElement) {
                element.value = '';
            } else { // contentEditable
                element.textContent = '';
            }

            // Set the new value
            if (isInputElement) {
                element.value = text;
            } else {
                element.textContent = text;
            }
            
            // Dispatch events that modern frameworks listen for
            element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

            if (pressEnter) {
                element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true }));
                element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true }));
            }
            
            element.blur();

        } else if (element.tagName === 'SELECT') {
            // For SELECT dropdowns, click to open first
            console.log('Element is a SELECT dropdown, clicking to open it');
            element.focus();
            element.click();
            
            // Wait for dropdown to open and search for any input field that appeared
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Look for a search input that might have appeared within or near the dropdown
            let searchInput = null;
            
            // Check if there's an input near the dropdown (common in custom dropdown libraries)
            const parent = element.parentElement;
            if (parent) {
                searchInput = parent.querySelector('input[type="text"], input[type="search"], input:not([type])');
            }
            
            // Also check for any focused input on the page
            if (!searchInput && document.activeElement && document.activeElement.tagName === 'INPUT') {
                searchInput = document.activeElement;
            }
            
            if (searchInput) {
                // Found a search input, type into it
                console.log('Found search input, typing into it:', searchInput);
                searchInput.focus();
                searchInput.value = text;
                searchInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                searchInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                
                if (pressEnter) {
                    searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true }));
                    searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true }));
                }
            } else {
                // No search input found, dispatch keyboard events to the select element
                console.log('No search input found, typing on select element');
                
                for (let char of text) {
                    element.dispatchEvent(new KeyboardEvent('keydown', { 
                        key: char, 
                        code: `Key${char.toUpperCase()}`,
                        bubbles: true, 
                        cancelable: true 
                    }));
                    element.dispatchEvent(new KeyboardEvent('keypress', { 
                        key: char,
                        code: `Key${char.toUpperCase()}`,
                        bubbles: true, 
                        cancelable: true 
                    }));
                    element.dispatchEvent(new KeyboardEvent('keyup', { 
                        key: char,
                        code: `Key${char.toUpperCase()}`,
                        bubbles: true, 
                        cancelable: true 
                    }));
                    await new Promise(resolve => setTimeout(resolve, 30));
                }
                
                // Try to find and select matching option programmatically as fallback
                const options = Array.from(element.options);
                const matchingOption = options.find(opt => 
                    opt.text.toLowerCase().includes(text.toLowerCase()) || 
                    opt.value.toLowerCase().includes(text.toLowerCase())
                );
                
                if (matchingOption) {
                    console.log('Found matching option:', matchingOption.text);
                    element.value = matchingOption.value;
                    matchingOption.selected = true;
                    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                } else {
                    console.log('No exact match found');
                }
            }
            
            console.log('Dropdown interaction completed');
        } else {
            // Fallback for other non-typable elements
            console.log('Element is not typable, attempting a click as a fallback.');
            element.click();
        }
} else {
        throw new Error(`No element found at coordinates: (${x}, ${y})`);
    }
}

async function simulateScrollDocument(direction) {
  const scrollAmount = window.innerHeight * 0.8; // Scroll by 80% of the viewport height
  switch (direction) {
    case 'down':
      window.scrollBy(0, scrollAmount);
      break;
    case 'up':
      window.scrollBy(0, -scrollAmount);
      break;
    case 'left':
      window.scrollBy(-window.innerWidth * 0.8, 0);
      break;
    case 'right':
      window.scrollBy(window.innerWidth * 0.8, 0);
      break;
    default:
      throw new Error(`Unknown scroll direction: ${direction}`);
  }
  // Wait for scroll to complete
  await new Promise(resolve => setTimeout(resolve, 500));
}

async function simulateScrollAt(x, y, direction, magnitude) {
    const element = findElement(x, y);
    
    let scrollableElement = element;
    // Traverse up the DOM to find a scrollable parent
    while (scrollableElement) {
        const canScrollY = scrollableElement.scrollHeight > scrollableElement.clientHeight;
        const canScrollX = scrollableElement.scrollWidth > scrollableElement.clientWidth;
        if (canScrollY || canScrollX) {
            break; // Found a scrollable element
        }
        if (scrollableElement === document.body || scrollableElement === document.documentElement) {
            break; // Reached the top
        }
        scrollableElement = scrollableElement.parentElement;
    }

    // If no specific element is scrollable, default to the window
    if (!scrollableElement || scrollableElement === document.body || scrollableElement === document.documentElement) {
        scrollableElement = window;
    }

    const defaultMagnitude = 800; // As per Gemini docs
    const scrollMagnitude = (magnitude || defaultMagnitude) / 1000;

    let scrollX = 0;
    let scrollY = 0;

    switch (direction) {
        case 'up':
            scrollY = -scrollMagnitude * (scrollableElement === window ? window.innerHeight : scrollableElement.clientHeight);
            break;
        case 'down':
            scrollY = scrollMagnitude * (scrollableElement === window ? window.innerHeight : scrollableElement.clientHeight);
            break;
        case 'left':
            scrollX = -scrollMagnitude * (scrollableElement === window ? window.innerWidth : scrollableElement.clientWidth);
            break;
        case 'right':
            scrollX = scrollMagnitude * (scrollableElement === window ? window.innerWidth : scrollableElement.clientWidth);
            break;
        default:
            throw new Error(`Unknown scroll direction: ${direction}`);
    }

    if (scrollableElement === window) {
        window.scrollBy(scrollX, scrollY);
    } else {
        scrollableElement.scrollBy({
            left: scrollX,
            top: scrollY,
            behavior: 'smooth'
        });
    }

    await new Promise(resolve => setTimeout(resolve, 500));
}
