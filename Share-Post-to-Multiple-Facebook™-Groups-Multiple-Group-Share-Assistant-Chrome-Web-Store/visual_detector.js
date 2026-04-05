// Enhanced Visual Form Field Detector
// This script uses AI vision to detect form fields visually on the page

class VisualFormDetector {
  constructor() {
    this.detectedFields = [];
    this.overlays = [];
    this.originalViewportInfo = null; // To store viewport info at the time of detection
  }

  // Take a screenshot and send to AI for visual field detection
  async detectFieldsVisually() {
    console.log('Starting visual field detection...');
    
    try {
      // Store viewport info at the moment of detection for accurate overlay positioning
      this.originalViewportInfo = {
        scrollX: window.pageXOffset || document.documentElement.scrollLeft,
        scrollY: window.pageYOffset || document.documentElement.scrollTop,
        width: window.innerWidth,
        height: window.innerHeight
      };

      // First, take a clean screenshot without any overlays
      const screenshot = await this.captureScreenshot();
      
      // Send to AI for visual analysis
      const detectedFields = await this.analyzeScreenshot(screenshot);
      
      // Create interactive overlays for detected fields
      this.createInteractiveOverlays(detectedFields);
      
      return detectedFields;
    } catch (error) {
      console.error('Visual detection failed:', error);
      throw error;
    }
  }

  // Capture screenshot of the visible area
  async captureScreenshot() {
    return new Promise((resolve, reject) => {
      // Request screenshot from background script
      chrome.runtime.sendMessage({ 
        type: 'capture_screenshot' 
      }, (response) => {
        if (response && response.screenshot) {
          resolve(response.screenshot);
        } else {
          reject(new Error('Failed to capture screenshot'));
        }
      });
    });
  }

  // Send screenshot to AI for visual field detection
  async analyzeScreenshot(screenshot) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'analyze_screenshot_for_fields',
        data: { screenshot }
      }, (response) => {
        if (response && response.fields) {
          this.detectedFields = response.fields;
          resolve(response.fields);
        } else {
          reject(new Error('Failed to analyze screenshot'));
        }
      });
    });
  }

  // Create interactive overlays that can be clicked to fill fields
  createInteractiveOverlays(fields) {
    // Remove any existing overlays
    this.removeOverlays();
    
    // Create a container for all overlays to ensure proper z-index management
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'visual-field-overlay-container';
    overlayContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    `;
    document.body.appendChild(overlayContainer);
    
    fields.forEach((field, index) => {
      const overlay = document.createElement('div');
      overlay.className = 'visual-field-overlay';
      overlay.dataset.fieldIndex = index;
      overlay.dataset.fieldType = field.type;
      overlay.dataset.fieldLabel = field.label;
      
      // The AI coordinates are relative to the viewport at the time of screenshot
      // We need to convert them to page coordinates
      const pageX = field.x + this.originalViewportInfo.scrollX;
      const pageY = field.y + this.originalViewportInfo.scrollY;
      
      // Position based on visual detection coordinates
      overlay.style.cssText = `
        position: absolute;
        left: ${pageX}px;
        top: ${pageY}px;
        width: ${field.width}px;
        height: ${field.height}px;
        border: 2px solid #ff6b00;
        background: rgba(255, 107, 0, 0.1);
        cursor: pointer;
        pointer-events: auto;
        box-sizing: border-box;
        transition: all 0.2s ease;
      `;
      
      // Add hover effect
      overlay.addEventListener('mouseenter', () => {
        overlay.style.background = 'rgba(255, 107, 0, 0.3)';
        overlay.style.borderWidth = '3px';
      });
      
      overlay.addEventListener('mouseleave', () => {
        overlay.style.background = 'rgba(255, 107, 0, 0.1)';
        overlay.style.borderWidth = '2px';
      });
      
      // Add label
      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        top: -25px;
        left: 0;
        background: #ff6b00;
        color: white;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      label.textContent = `${index + 1}: ${field.label || 'Field ' + (index + 1)}`;
      overlay.appendChild(label);
      
      // Add click handler
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.handleFieldClick(field, index, pageX, pageY);
      });
      
      overlayContainer.appendChild(overlay);
      this.overlays.push(overlay);
    });
    
    // Store container reference
    this.overlayContainer = overlayContainer;
  }

  // Handle clicking on a detected field
  async handleFieldClick(field, index, pageX, pageY) {
    console.log(`Clicked on field ${index + 1}: ${field.label}`);
    
    // Calculate the center of the field in viewport coordinates
    const currentScrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    const viewportX = pageX - currentScrollX + field.width / 2;
    const viewportY = pageY - currentScrollY + field.height / 2;
    
    // Temporarily hide overlays to access the actual element
    if (this.overlayContainer) {
      this.overlayContainer.style.display = 'none';
    }
    
    // Find the actual element at these coordinates
    const element = document.elementFromPoint(viewportX, viewportY);
    
    if (element) {
      console.log('Found element:', element.tagName, element.type);
      
      // Try to focus and prepare for input
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
        element.focus();
        element.click();
        
        // Highlight the field
        const originalBorder = element.style.border;
        element.style.border = '3px solid #ff6b00';
        setTimeout(() => {
          element.style.border = originalBorder;
        }, 1000);
      } else {
        // Click might reveal an input field
        element.click();
        
        // Wait a bit and check for newly revealed input
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const newElement = document.elementFromPoint(viewportX, viewportY);
        if (newElement && (newElement.tagName === 'INPUT' || newElement.tagName === 'TEXTAREA')) {
          newElement.focus();
          
          // Highlight the field
          const originalBorder = newElement.style.border;
          newElement.style.border = '3px solid #ff6b00';
          setTimeout(() => {
            newElement.style.border = originalBorder;
          }, 1000);
        }
      }
    }
    
    // Restore overlays
    if (this.overlayContainer) {
      this.overlayContainer.style.display = '';
    }
  }

  // Fill field at specific coordinates with value
  async fillFieldAtCoordinates(x, y, value) {
    // x,y are viewport coordinates from the AI detection
    // Convert to page coordinates
    const pageX = x + this.originalViewportInfo.scrollX;
    const pageY = y + this.originalViewportInfo.scrollY;
    
    // Get current scroll position
    const currentScrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Convert to current viewport coordinates
    const viewportX = pageX - currentScrollX;
    const viewportY = pageY - currentScrollY;
    
    // Temporarily hide overlays
    const overlaysWereVisible = this.overlayContainer && this.overlayContainer.style.display !== 'none';
    if (this.overlayContainer) {
      this.overlayContainer.style.display = 'none';
    }
    
    let success = false;
    // Find element at coordinates
    const element = document.elementFromPoint(viewportX, viewportY);
    if (element) {
      console.log('Filling element:', element.tagName, element.type);
      
      // Click to focus
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: viewportX,
        clientY: viewportY
      });
      element.dispatchEvent(clickEvent);
      element.click();
      
      // Wait for any animations or dynamic content
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Find the active element (should be the input field)
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        // Use the robust filling function
        success = this.fillFieldRobustly(activeElement, value);
      } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        // Try filling the original element
        success = this.fillFieldRobustly(element, value);
      } else {
        // Try typing anyway in case there's a hidden input
        this.simulateTyping(value);
        success = true; // Assume success for simulated typing
      }
    }
    
    // Restore overlays if they were visible
    if (overlaysWereVisible && this.overlayContainer) {
      setTimeout(() => {
        this.overlayContainer.style.display = '';
      }, 500);
    }
    return success;
  }

  // Simulate typing for fields that don't expose standard input elements
  simulateTyping(text) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const keyEvent = new KeyboardEvent('keypress', {
        key: char,
        char: char,
        keyCode: char.charCodeAt(0),
        which: char.charCodeAt(0),
        bubbles: true
      });
      document.activeElement.dispatchEvent(keyEvent);
    }
  }

  // Robust field filling (reused from content.js)
  fillFieldRobustly(element, value) {
    if (!element || !value) return false;

    if (element.tagName === 'SELECT') {
      console.warn(`Skipping dropdown/select field. Visual fill does not support selecting options.`);
      return false; // Skip this field
    }
    
    try {
      element.focus();
      element.value = '';
      
      // Simulate typing character by character
      for (let i = 0; i < value.length; i++) {
        element.value = value.substring(0, i + 1);
        element.dispatchEvent(new Event('input', { 
          bubbles: true, 
          cancelable: true,
          composed: true 
        }));
      }
      
      // Final events
      element.value = value;
      ['input', 'change', 'blur'].forEach(eventType => {
        element.dispatchEvent(new Event(eventType, {
          bubbles: true,
          cancelable: true,
          composed: true
        }));
      });
      
      // React-specific handling
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      console.log(`Filled field with value: ${value}`);
      return true;
    } catch (error) {
      console.error('Error filling field:', error);
      return false;
    }
  }

  // Remove all overlays
  removeOverlays() {
    if (this.overlayContainer) {
      this.overlayContainer.remove();
      this.overlayContainer = null;
    }
    this.overlays = [];
  }

  // Get field at specific index
  getField(index) {
    return this.detectedFields[index];
  }

  // Get all detected fields
  getAllFields() {
    return this.detectedFields;
  }
}

// Initialize the visual detector
const visualDetector = new VisualFormDetector();

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'get_viewport_info') {
    // Return viewport dimensions
    sendResponse({
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.pageXOffset || document.documentElement.scrollLeft,
      scrollY: window.pageYOffset || document.documentElement.scrollTop
    });
    return true;
  } else if (request.type === 'start_visual_detection') {
    visualDetector.detectFieldsVisually()
      .then(fields => {
        sendResponse({ success: true, fields });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Async response
  } else if (request.type === 'fill_visual_form') {
    const { fields } = request.data;
    (async () => {
      let filledCount = 0;
      for (const field of fields) {
        const success = await visualDetector.fillFieldAtCoordinates(field.x, field.y, field.value);
        if (success) {
          filledCount++;
        }
        // Add a small delay between filling fields
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      sendResponse({ success: true, filledCount });
    })();
    return true; // Async response
  } else if (request.type === 'remove_visual_overlays') {
    visualDetector.removeOverlays();
    sendResponse({ success: true });
  } else if (request.type === 'find_fields_from_ocr') {
    // This message is received from the background script after OCR is complete
    const { ocrData } = request.data;
    if (ocrData && ocrData.text) {
      console.log('Content script received OCR data, finding field locations...');
      const fields = visualDetector.findFieldsFromOcrText(ocrData);
      sendResponse(fields);
    } else {
      sendResponse([]);
    }
    return true; // No async response needed here
  }
});

// Add the new method to the VisualFormDetector class
VisualFormDetector.prototype.findFieldsFromOcrText = function(ocrData) {
  const detectedFields = [];
  // For now, we'll assume the OCR data gives us words and their bounding boxes
  // A more sophisticated approach would be needed for real-world scenarios
  if (ocrData.words) {
    ocrData.words.forEach(word => {
      // This is a simplified example. A real implementation would need to
      // intelligently group words into labels and identify associated input fields.
      // For this example, we'll just treat every recognized word as a potential field label.
      detectedFields.push({
        label: word.text,
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        type: 'ocr-detected'
      });
    });
  }
  this.detectedFields = detectedFields;
  return detectedFields;
};


console.log('Visual detector initialized');
