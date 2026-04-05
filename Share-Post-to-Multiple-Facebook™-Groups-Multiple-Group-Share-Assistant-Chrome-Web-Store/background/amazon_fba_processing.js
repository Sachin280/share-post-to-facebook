import { getFbaFieldPairsFromAI } from './api.js';
import { formatApiError, extractRetryDelay } from './error_formatter.js';

export async function startAmazonFbaFill(inputData, extraPrompt) {
    console.log('Background: Starting Amazon FBA fill...');

    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
          throw new Error('No active tab found.');
        }

        // First, get all the text from the page using the existing force-capture method
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['text_selection_detector.js']
        });
        const textResult = await chrome.tabs.sendMessage(tab.id, { type: 'force_capture_text' });
        if (!textResult.success) {
          throw new Error(textResult.error || 'Failed to capture page text for FBA fill.');
        }
        const pageText = textResult.data.text;

        // Now, use the AI to get the label-value pairs
        const fieldPairs = await getFbaFieldPairsFromAI(pageText, inputData, extraPrompt);

        // Inject the specialized FBA filler script and command it to fill the form
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['amazon_fba_filler.js']
        });
        const result = await chrome.tabs.sendMessage(tab.id, {
          type: 'fill_amazon_fba_form',
          data: { fieldPairs, inputData }
        });

        chrome.runtime.sendMessage({
          type: 'form_filled',
          success: result.success,
          filledCount: result.filledCount,
          totalFields: fieldPairs.length,
          error: result.error
        });

      } catch (error) {
        console.error('Error during Amazon FBA fill:', error);
        const friendlyError = formatApiError(error);
        const retryDelay = extractRetryDelay(error);
        chrome.runtime.sendMessage({ 
          type: 'error', 
          message: friendlyError + retryDelay
        });
      }
    })();
}
