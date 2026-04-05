// content_main.js - Initialization and Event Listeners
(function() {
  'use strict';
  
  console.log('Share Unilimited content script loaded and active.');
  
  // Ensure namespace exists (should be created by core/ui scripts)
  window.ShareUnlimited = window.ShareUnlimited || {};
  
  const Core = window.ShareUnlimited.Core;
  const UI = window.ShareUnlimited.UI;
  const State = window.ShareUnlimited.State;
  
  // --- DOM Observer Logic ---

  let lastProcessedDialog = null;
  let shareToGroupHeadingPresent = false;

  /**
   * Sets up an interceptor on the "Post" button.
   */
  function setupPostButtonInterceptor() {
    if (!Core || !Core.findPostButton) return;
    
    const postButton = Core.findPostButton();

    if (postButton && !postButton.dataset.intercepted) {
      postButton.dataset.intercepted = 'true';

      const interceptor = async (event) => {
        // If automated sharing is in progress, ignore interception
        if (State && State.isSharingInProgress) {
          console.log('Post button clicked, allowing pass-through (automation active)');
          return;
        }

        console.log('Post button clicked, intercepting...');
        
        event.stopPropagation();
        event.preventDefault();

        if (Core.handleMultiPost) {
          const shouldProceed = await Core.handleMultiPost();
          
          if (shouldProceed) {
            // Remove listener to allow click to pass
            postButton.removeEventListener('click', interceptor, true);
            postButton.click();
            // Re-add listener after a short delay
            setTimeout(() => {
               postButton.addEventListener('click', interceptor, true);
            }, 500);
          }
        }
      };

      // We add our listener in the "capture" phase to ensure it runs before any other listeners.
      postButton.addEventListener('click', interceptor, true);
    }
  }

  /**
   * Checks if "Share to a group" heading is present in any dialog
   */
  function isShareToGroupHeadingPresent() {
    const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
    if (!dialog) return false;
    
    const h2Elements = dialog.querySelectorAll('h2');
    for (const h2 of h2Elements) {
      const h2Text = h2.textContent.trim();
      const spanInH2 = h2.querySelector('span');
      const spanText = spanInH2 ? spanInH2.textContent.trim() : '';
      
      if (h2Text === 'Share to a group' || spanText === 'Share to a group') {
        return true;
      }
    }
    return false;
  }

  /**
   * Starts aggressive scanning when "Share to a group" heading is detected
   */
  function startAggressiveScanning() {
    // Clear any existing interval first
    if (window.groupScanInterval) {
      clearInterval(window.groupScanInterval);
      window.groupScanInterval = null;
    }
    
    console.log('🔄 Starting aggressive checkbox scanning (every 1.5s)...');
    
    // Run immediately
    if (UI && UI.addCheckboxesToGroups) {
      UI.addCheckboxesToGroups();
    }
    setupPostButtonInterceptor();
    
    // Then run every 1.5 seconds
    window.groupScanInterval = setInterval(() => {
      const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
      
      // Check if dialog still exists and heading is still present
      if (!dialog || !isShareToGroupHeadingPresent()) {
        console.log('⏹️ "Share to a group" heading no longer present, stopping scan');
        clearInterval(window.groupScanInterval);
        window.groupScanInterval = null;
        shareToGroupHeadingPresent = false;
        return;
      }
      
      // Re-add checkboxes if needed
      if (UI && UI.addCheckboxesToGroups) {
        UI.addCheckboxesToGroups();
      }
      setupPostButtonInterceptor();
    }, 1500);
  }

  /**
   * Checks if the current dialog has the group list (called on dialog content changes)
   */
  function checkForGroupDialog() {
    const headingPresent = isShareToGroupHeadingPresent();
    
    // Heading appeared or reappeared
    if (headingPresent && !shareToGroupHeadingPresent) {
      console.log('✅ "Share to a group" heading DETECTED - starting aggressive scanning');
      shareToGroupHeadingPresent = true;
      startAggressiveScanning();
    }
    // Heading disappeared
    else if (!headingPresent && shareToGroupHeadingPresent) {
      console.log('⏹️ "Share to a group" heading DISAPPEARED - stopping scanning');
      shareToGroupHeadingPresent = false;
      if (window.groupScanInterval) {
        clearInterval(window.groupScanInterval);
        window.groupScanInterval = null;
      }
    }
  }

  /**
   * Watches for the share dialog to appear and initializes the script.
   */
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Check for the dialog with aria-labelledby
        const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
        
        // Check if dialog was just removed
        if (!dialog && lastProcessedDialog) {
            console.log('📴 Group selection dialog removed');
            lastProcessedDialog = null;
            shareToGroupHeadingPresent = false;
            if (window.groupScanInterval) {
                console.log('⏹️ Clearing group scan interval');
                clearInterval(window.groupScanInterval);
                window.groupScanInterval = null;
            }
        }

        // If dialog exists, check if it has the group list
        if (dialog) {
          checkForGroupDialog();
        }
      }
    }
  });

  // Start observing the entire document body for changes.
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // --- Multi-Group Button Observer ---
  
  /**
   * Sets up an observer to continuously watch for Share buttons and add Multi-Group buttons
   */
  function setupMultiGroupButtonObserver() {
    console.log('🔍 Setting up Multi-Group button observer...');
    
    // Run once on page load
    if (UI && UI.addMultiGroupButtons) {
      UI.addMultiGroupButtons();
    }
    
    // Use a debounced approach to prevent excessive calls
    let debounceTimer = null;
    
    // Set up a mutation observer to watch for new Share buttons
    const multiGroupObserver = new MutationObserver(() => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Set a new timer - only run after 500ms of no mutations
      debounceTimer = setTimeout(() => {
        if (UI && UI.addMultiGroupButtons) {
          UI.addMultiGroupButtons();
        }
      }, 500);
    });
    
    // Start observing
    multiGroupObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ Multi-Group button observer active');
  }
  
  // Initialize Multi-Group button observer when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMultiGroupButtonObserver);
  } else {
    setupMultiGroupButtonObserver();
  }

  // --- Message Listeners ---

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'ping') {
      console.log('Received ping from popup');
      sendResponse({ status: 'ready' });
      return true;
    }

    if (request.type === 'get_groups') {
      if (Core && Core.getGroupNames) {
        Core.getGroupNames().then(groups => {
          console.log('Popup requested groups, found:', groups);
          sendResponse({ groups: groups });
        });
      } else {
        sendResponse({ groups: [] });
      }
      return true; 
    }

    if (request.type === 'show_all_groups') {
      console.log('Show all groups requested from popup');
      
      const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
      if (!dialog) {
        sendResponse({ success: false, message: 'Group dialog not open. Please open "Share to a group" dialog first.' });
        return true;
      }
      
      const h2Elements = dialog.querySelectorAll('h2');
      let isShareToGroupDialog = false;
      for (const h2 of h2Elements) {
        const h2Text = h2.textContent.trim();
        const spanInH2 = h2.querySelector('span');
        const spanText = spanInH2 ? spanInH2.textContent.trim() : '';
        if (h2Text === 'Share to a group' || spanText === 'Share to a group') {
          isShareToGroupDialog = true;
          break;
        }
      }
      
      if (!isShareToGroupDialog) {
        sendResponse({ success: false, message: 'Wrong dialog open. Please open "Share to a group" dialog.' });
        return true;
      }
      
      (async () => {
        if (!Core) {
           sendResponse({ success: false, message: 'Core not loaded' });
           return;
        }
        
        console.log('Clearing search input before loading all groups...');
        const searchInputs = dialog.querySelectorAll('input[type="search"], input[placeholder*="Search"], input[aria-label*="Search"]');
        for (const input of searchInputs) {
          if (input.value) {
            console.log('Found search input with value, clearing it:', input.value);
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            await Core.sleep(500); 
          }
        }
        
        // FIX: Move addedGroupNames Set OUTSIDE the callback to persist across all scroll iterations
        // This prevents the same group from being processed multiple times
        const addedGroupNames = new Set();
        
        await Core.scrollToLoadAllGroups(() => {
          const allButtons = dialog.querySelectorAll('div[role="button"]');
          let newCheckboxes = 0;
          
          allButtons.forEach((button) => {
            const buttonText = button.textContent.trim();
            const buttonTextLength = buttonText.length;
            const hasImage = button.querySelector('image, img, svg') !== null;
            
            const hasGroupIndicator = buttonText.includes('Public group') || 
                                     buttonText.includes('Private group') ||
                                     buttonText.toLowerCase().includes('members');
            
            if (buttonTextLength > 10 && buttonTextLength < 200 && hasImage && hasGroupIndicator) {
              // Use the same validation as getGroupNames()
              const groupName = Core.extractAndValidateGroupName(buttonText);
              if (groupName && !addedGroupNames.has(groupName) && !button.querySelector('.multi-share-checkbox')) {
                addedGroupNames.add(groupName);
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'multi-share-checkbox';
                checkbox.style.cssText = `
                  margin-right: 16px !important; 
                  height: 44px !important; 
                  width: 44px !important; 
                  cursor: pointer !important; 
                  z-index: 9999 !important; 
                  position: relative !important;
                  accent-color: #1877f2 !important;
                  border: 3px solid #1877f2 !important;
                  border-radius: 6px !important;
                  flex-shrink: 0 !important;
                  background: white !important;
                `;
                
                // Restore saved selection state
                if (UI && UI.applySelectionState) {
                  const selections = sessionStorage.getItem('shareUnlimited_checkboxSelections');
                  if (selections) {
                    try {
                      const parsed = JSON.parse(selections);
                      if (parsed[groupName] === true) {
                        checkbox.checked = true;
                      }
                    } catch (e) {}
                  }
                }
                
                checkbox.addEventListener('click', (e) => { 
                  e.stopPropagation(); 
                  // Save selections when checkbox state changes
                  setTimeout(() => {
                    const selections = {};
                    document.querySelectorAll('.multi-share-checkbox').forEach(cb => {
                      const btn = cb.closest('div[role="button"]');
                      if (btn && Core && Core.extractAndValidateGroupName) {
                        const btnText = btn.textContent.trim();
                        const gName = Core.extractAndValidateGroupName(btnText);
                        if (gName) {
                          selections[gName] = cb.checked;
                        }
                      }
                    });
                    sessionStorage.setItem('shareUnlimited_checkboxSelections', JSON.stringify(selections));
                  }, 100);
                }, true);
                checkbox.addEventListener('mousedown', (e) => { e.stopPropagation(); }, true);
                
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.gap = '8px';
                button.prepend(checkbox);
                newCheckboxes++;
              }
            }
          });
          
          return newCheckboxes;
        });
        
        const groups = await Core.getGroupNames();
        console.log(`✓ All groups loaded: ${groups.length} total`);
        sendResponse({ success: true, totalGroups: groups.length });
      })();
      
      return true; 
    }

    if (request.type === 'share_to_groups') {
      console.log('Popup requested sharing to groups:', request.groups);
      if (Core && Core.shareToSelectedGroups) {
        Core.shareToSelectedGroups(
          request.groups, 
          request.postContent, 
          request.postVariations, 
          request.postSignature, 
          request.delay, 
          request.randomizeDelay
        ).then(result => {
          sendResponse(result);
        });
      } else {
        sendResponse({ success: false, message: 'Core functionality not loaded' });
      }
      return true; 
    }
  });

})();
