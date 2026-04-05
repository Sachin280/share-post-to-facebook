// Offscreen document setup
let creating; // To prevent multiple creation attempts
async function setupOffscreenDocument(path) {
  // Try to close any existing offscreen document first
  try {
    await chrome.offscreen.closeDocument();
  } catch (e) {
    // Document might not exist, that's okay
  }
  
  // Small delay to ensure cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['WORKERS'],
      justification: 'Perform OCR on screenshots using Tesseract.js worker',
    });
    await creating;
    creating = null;
  }
}

// Perform OCR using the offscreen document
export async function performOcr(screenshot) {
  // Temporarily use the CDN-based version for testing
  await setupOffscreenDocument('offscreen-simple.html');
  
  // Add a small delay to ensure offscreen document is ready
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return new Promise((resolve, reject) => {
    // Increase timeout to 60 seconds for complex pages
    const timeout = setTimeout(() => {
      console.error('OCR timeout reached after 60 seconds');
      reject(new Error('OCR processing is taking longer than expected. This might be due to a complex page. Please try again with a simpler view or zoom in on the form area.'));
    }, 60000);

    // Track if we've received any response
    let responseReceived = false;
    
    // Create a unique ID for this OCR request
    const requestId = Date.now().toString();

    // Set up listener BEFORE sending the message
    const listener = (message, sender, sendResponse) => {
      console.log('Background received message:', message.type);
      
      if (message.type === 'offscreen_ocr_result' && message.requestId === requestId) {
        responseReceived = true;
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        
        if (message.success) {
          console.log('OCR completed successfully');
          resolve(message.ocrData);
        } else {
          console.error('OCR failed:', message.error);
          reject(new Error(message.error || 'Unknown OCR error'));
        }
      }
    };
    
    chrome.runtime.onMessage.addListener(listener);

    // Send OCR request with unique ID
    console.log('Sending OCR request to offscreen document...');
    console.log('Screenshot size:', screenshot.length);
    console.log('Request ID:', requestId);
    
    // Broadcast the message
    chrome.runtime.sendMessage({
      type: 'offscreen_ocr_request',
      requestId: requestId,
      data: { screenshot },
    }).catch(err => {
      console.error('Failed to send message:', err);
    });

    // Add a check after 5 seconds to see if offscreen is responding
    setTimeout(() => {
      if (!responseReceived) {
        console.log('OCR is still processing... This may take a moment for complex pages.');
        chrome.runtime.sendMessage({ type: 'ocr_processing_update' });
      }
    }, 5000);
  });
}
