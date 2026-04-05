import { checkAuthCode } from './auth.js';
import { InstallationIdManager } from './installation_id.js';
import { generatePostVariations } from './api.js';

// ==================== UNIVERSAL USER-AGENT SPOOFING ====================
// This ensures ALL users get the EXACT SAME Facebook UI regardless of their platform
// Forces Facebook to serve Windows Chrome UI to everyone for consistent element detection

/**
 * Sets up UNIVERSAL User-Agent spoofing for Facebook - applies to ALL users
 */
async function setupUserAgentSpoofing() {
  console.log('🌍 Platform: Universal - Setting up User-Agent spoofing for ALL users');
  
  try {
    // Remove any existing rules first
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map(rule => rule.id);
    
    if (ruleIdsToRemove.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove
      });
    }
    
    // Add new rule to spoof User-Agent for Facebook
    const rules = [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'user-agent',
              operation: 'set',
              value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
          ]
        },
        condition: {
          urlFilter: '*://*.facebook.com/*',
          resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest']
        }
      }
    ];
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
    });
    
    console.log('✅ User-Agent spoofing enabled for Facebook - ALL users appear as Windows Chrome');
    
    // Store the spoofing status
    chrome.storage.local.set({ 
      userAgentSpoofingActive: true,
      spoofedPlatform: 'Windows'
    });
    
  } catch (error) {
    console.error('❌ Failed to setup User-Agent spoofing:', error);
  }
}

// ==================== END UNIVERSAL USER-AGENT SPOOFING ====================

/**
 * Injects content scripts into existing Facebook tabs upon installation
 * This allows the extension to work immediately without requiring a refresh
 */
async function injectContentScriptsIntoFacebookTabs() {
  console.log('Attempting to inject content scripts into open Facebook tabs...');
  try {
    const tabs = await chrome.tabs.query({ url: ['*://*.facebook.com/*', '*://facebook.com/*'] });
    
    if (tabs.length === 0) {
      console.log('No open Facebook tabs found to inject scripts into.');
      return;
    }

    const scripts = [
      "expired_overlay.js",
      "content_core.js",
      "content_ui_progress.js",
      "content_ui_modals.js",
      "content_ui_elements.js",
      "content_main.js"
    ];

    console.log(`Found ${tabs.length} Facebook tabs. Injecting scripts:`, scripts);

    for (const tab of tabs) {
      // Skip if the tab is restricted (e.g. chrome:// URLs)
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) continue;

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: scripts
        });
        console.log(`Successfully injected scripts into tab ${tab.id}`);
      } catch (err) {
        // Ignore errors for tabs where we can't inject (e.g. restricted domains that matched wildcard somehow, or closed tabs)
        console.warn(`Failed to inject scripts into tab ${tab.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error querying or injecting into tabs:', error);
  }
}

// Initialize unique installation ID on extension install/startup
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated - ensuring unique installation ID exists');
  InstallationIdManager.getUniqueInstallationId().then(id => {
    console.log('Unique installation ID initialized:', id);
  });
  
  // Setup Universal User-Agent spoofing for ALL users
  setupUserAgentSpoofing();

  // Inject scripts into open tabs if this is a fresh install or update
  // We do this for both install and update to ensure the latest scripts are running
  injectContentScriptsIntoFacebookTabs();
});

// Also initialize on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup - ensuring unique installation ID exists');
  InstallationIdManager.getUniqueInstallationId().then(id => {
    console.log('Unique installation ID confirmed:', id);
  });
  
  // Re-setup User-Agent spoofing on browser restart
  setupUserAgentSpoofing();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request.type);

  if (request.type === 'check_auth_code') {
    // Use unique installation ID for authentication
    InstallationIdManager.getUniqueInstallationId().then(uniqueId => {
      checkAuthCode(uniqueId).then(sendResponse);
    });
    return true; // Indicates asynchronous response
  }

  if (request.type === 'get_installation_id') {
    // Get installation ID for signup purposes
    InstallationIdManager.getUniqueInstallationId().then(uniqueId => {
      sendResponse({ installationId: uniqueId });
    });
    return true; // Indicates asynchronous response
  }

  if (request.type === 'generate_content') {
    console.log('Generating content variations...');
    generatePostVariations(request.prompt, request.count, request.apiKey, request.systemPrompt)
      .then(variations => {
        sendResponse({ success: true, variations });
      })
      .catch(error => {
        console.error('Generation error:', error);
        sendResponse({ success: false, message: error.message });
      });
    return true; // Indicates asynchronous response
  }
  
  // All other form-filling message types have been removed.
});
