// expired_overlay.js - Overlay for expired license users
(function() {
  'use strict';

  /**
   * Creates an unclickable overlay for expired users in the popup
   */
  function createPopupExpiredOverlay() {
    // Check if already exists
    if (document.getElementById('expired-license-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'expired-license-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: all;
      backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(overlay);
    
    // Make sure the validation view is on top of the overlay with relative positioning
    const validationView = document.getElementById('validation-view');
    const authSection = document.getElementById('auth-section');
    const settingsContainer = document.getElementById('settings-container');
    const wrapper = document.querySelector('.wrapper');
    
    if (validationView) {
      validationView.style.zIndex = '100000';
      validationView.style.position = 'relative';
    }
    if (authSection) {
      authSection.style.zIndex = '100000';
      authSection.style.position = 'relative';
    }
    if (settingsContainer) {
      settingsContainer.style.zIndex = '100000';
      settingsContainer.style.position = 'relative';
    }
    if (wrapper) {
      wrapper.style.position = 'relative';
    }
    
    // Ensure share container is behind and unclickable
    const shareContainer = document.getElementById('share-container');
    if (shareContainer) {
      shareContainer.style.pointerEvents = 'none';
      shareContainer.style.filter = 'blur(5px)';
      shareContainer.style.opacity = '0.3';
      shareContainer.style.zIndex = '1';
    }
  }

  /**
   * Removes the expired overlay from popup
   */
  function removePopupExpiredOverlay() {
    const overlay = document.getElementById('expired-license-overlay');
    if (overlay) overlay.remove();
    
    // Restore normal functionality
    const shareContainer = document.getElementById('share-container');
    if (shareContainer) {
      shareContainer.style.pointerEvents = 'auto';
      shareContainer.style.filter = 'none';
      shareContainer.style.opacity = '1';
    }
    
    // Reset z-indexes
    const validationView = document.getElementById('validation-view');
    const authSection = document.getElementById('auth-section');
    const settingsContainer = document.getElementById('settings-container');
    
    if (validationView) validationView.style.zIndex = '';
    if (authSection) authSection.style.zIndex = '';
    if (settingsContainer) settingsContainer.style.zIndex = '';
  }

  /**
   * Creates the expired user button on Facebook (replaces the action buttons)
   */
  function createFacebookExpiredButton(container) {
    // Check if expired button already exists
    if (document.getElementById('share-unlimited-expired-cta')) return;
    
    // Check if user has an expiry date (new user vs expired user)
    chrome.storage.local.get(['authExpiry'], (result) => {
      const { authExpiry } = result;
      const hasNeverStartedTrial = !authExpiry; // No expiry date means never started
      const hasExpiredTrial = authExpiry && new Date(authExpiry) <= new Date();
      
      if (hasNeverStartedTrial) {
        // === NEW USER (BLOCKING MODE) ===
        // Remove existing buttons/containers to block usage
        const selectAllContainer = document.getElementById('share-unlimited-select-all-container');
        const quickShareButton = document.getElementById('share-unlimited-quick-share-btn');
        if (selectAllContainer) selectAllContainer.remove();
        if (quickShareButton) quickShareButton.remove();

        // Create the blocking CTA container
        const expiredContainer = document.createElement('div');
        expiredContainer.id = 'share-unlimited-expired-cta';
        expiredContainer.style.cssText = `
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            z-index: 10;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        `;
        
        // Create button container for multiple buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
            justify-content: center;
        `;
        
        const mainButton = document.createElement('button');
        mainButton.style.cssText = `
            background: rgba(255, 255, 255, 0.25);
            border: 2px solid white;
            color: white;
            padding: 14px 32px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            letter-spacing: 0.5px;
            position: relative;
            z-index: 1;
        `;
        
        console.log('User status: Never started trial (no authExpiry)');
        mainButton.innerHTML = '🚀 Click Here to Start Your Trial';
        
        mainButton.addEventListener('mouseenter', () => {
            mainButton.style.background = 'rgba(255, 255, 255, 0.35)';
            mainButton.style.transform = 'translateY(-2px) scale(1.02)';
            mainButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        });
        
        mainButton.addEventListener('mouseleave', () => {
            mainButton.style.background = 'rgba(255, 255, 255, 0.25)';
            mainButton.style.transform = 'translateY(0) scale(1)';
            mainButton.style.boxShadow = 'none';
        });

        mainButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Set flag to indicate user has likely signed up
            chrome.storage.local.set({ hasClickedSignup: true }, () => {
                console.log('User clicked signup - starting license polling...');
                startLicensePolling();
            });
            
            // [MODIFIED FOR PERSONAL USE - Developer Mode]
            // Renewal URL disabled - license is permanent
            console.log('Renewal disabled in Developer Mode - license is permanent until 2030');
        });

        buttonContainer.appendChild(mainButton);
        expiredContainer.appendChild(buttonContainer);
        
        // Insert into the dialog
        if (container && container.parentElement) {
            container.parentElement.insertBefore(expiredContainer, container);
        }

      } else if (hasExpiredTrial) {
        // === EXPIRED USER (BANNER MODE) ===
        // Do NOT remove existing buttons.
        
        const expiredContainer = document.createElement('div');
        expiredContainer.id = 'share-unlimited-expired-cta';
        expiredContainer.style.cssText = `
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #242526;
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 8px;
            margin-bottom: 12px;
            cursor: pointer;
            z-index: 10;
            position: relative;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
        `;
        
        expiredContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 16px;">💎</span>
                <span style="color: #FF6B6B; font-weight: 600; font-size: 14px; letter-spacing: 0.3px;">Remove Watermark - Extend today!</span>
            </div>
        `;
        
        expiredContainer.addEventListener('mouseenter', () => {
            expiredContainer.style.transform = 'translateY(-1px)';
            expiredContainer.style.background = '#2D2E2F';
            expiredContainer.style.borderColor = 'rgba(255, 107, 107, 0.5)';
            expiredContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        });
        
        expiredContainer.addEventListener('mouseleave', () => {
            expiredContainer.style.transform = 'translateY(0)';
            expiredContainer.style.background = '#242526';
            expiredContainer.style.borderColor = 'rgba(255, 107, 107, 0.3)';
            expiredContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        });
        
        expiredContainer.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Change banner appearance to loading state
            const originalContent = expiredContainer.innerHTML;
            expiredContainer.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><span style="color: white; font-weight: 700;">⏳ Checking license...</span></div>';
            
            // Check for license
            const hasLicense = await checkAndActivateLicense();
            
            if (hasLicense) {
                // License is valid!
                expiredContainer.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><span style="color: white; font-weight: 700;">✅ License Found!</span></div>';
                expiredContainer.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
                
                // Clear the flag since license is now valid
                chrome.storage.local.set({ hasClickedContinueSharing: false }, () => {
                    // Remove banner after a short delay
                    setTimeout(() => {
                        expiredContainer.style.opacity = '0';
                        setTimeout(() => {
                            expiredContainer.remove();
                        }, 500);
                    }, 1500);
                });
                return;
            }
            
            // License still expired - restore banner and open URL
            expiredContainer.innerHTML = originalContent;
            
            // Open renewal URL logic
            chrome.storage.local.get(['userEmail', 'userName', 'uniqueInstallationId'], (result) => {
                const { userEmail, userName, uniqueInstallationId } = result;
                if (uniqueInstallationId && userEmail) {
                    const renewUrl = `http://inventabot.com/software/shareunlimited?auth=${uniqueInstallationId}&email=${userEmail}${userName ? '&name=' + encodeURIComponent(userName) : ''}`;
                    window.open(renewUrl, '_blank');
                } else {
                    chrome.runtime.sendMessage({ type: 'get_installation_id' }, (response) => {
                        if (response && response.installationId) {
                            const renewUrl = `http://inventabot.com/software/shareunlimited?auth=${response.installationId}${userEmail ? '&email=' + userEmail : ''}${userName ? '&name=' + encodeURIComponent(userName) : ''}`;
                            window.open(renewUrl, '_blank');
                        }
                    });
                }
            });
        });
        
        // Insert into the dialog (before container)
        if (container && container.parentElement) {
            container.parentElement.insertBefore(expiredContainer, container);
        }
      }
    });
  }

  /**
   * Checks if the user's license is expired
   */
  function checkLicenseExpiry(callback) {
    chrome.storage.local.get(['authExpiry'], (result) => {
      const { authExpiry } = result;
      const isExpired = !authExpiry || new Date(authExpiry) <= new Date();
      callback(isExpired);
    });
  }

  /**
   * Checks for license and activates if found
   * Returns true if valid license found, false otherwise
   */
  async function checkAndActivateLicense() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'check_auth_code' }, (response) => {
        if (response && response.success && response.expiry) {
          const expiryDate = new Date(response.expiry);
          const now = new Date();
          
          if (expiryDate > now) {
            // Valid license found!
            chrome.storage.local.set({ authExpiry: response.expiry }, () => {
              console.log('✓ License activated! Expiry:', response.expiry);
              resolve(true);
            });
          } else {
            // License expired
            resolve(false);
          }
        } else {
          // No valid license
          resolve(false);
        }
      });
    });
  }

  /**
   * Polls for license activation every 5 seconds
   * Stops after 10 minutes or when license is found
   */
  function startLicensePolling() {
    let pollCount = 0;
    const maxPolls = 120; // 10 minutes (120 * 5 seconds)
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      console.log(`License polling attempt ${pollCount}/${maxPolls}...`);
      
      const hasLicense = await checkAndActivateLicense();
      
      if (hasLicense) {
        console.log('✓ License detected! Switching to regular overlay...');
        clearInterval(pollInterval);
        
        // Find the container and switch overlay
        const expiredContainer = document.getElementById('share-unlimited-expired-cta');
        if (expiredContainer && expiredContainer.parentElement) {
          const container = expiredContainer.nextElementSibling;
          switchToRegularOverlay(container);
        }
      } else if (pollCount >= maxPolls) {
        console.log('License polling timeout - stopping after 10 minutes');
        clearInterval(pollInterval);
        chrome.storage.local.set({ hasClickedSignup: false });
      }
    }, 5000); // Check every 5 seconds
    
    // Store interval ID so it can be cleared if needed
    window.licensePollingInterval = pollInterval;
  }

  /**
   * Switches from expired overlay to regular overlay with the full UI
   */
  function switchToRegularOverlay(container) {
    // Remove the expired button
    const expiredContainer = document.getElementById('share-unlimited-expired-cta');
    if (expiredContainer) {
      expiredContainer.remove();
    }
    
    // Stop any ongoing polling
    if (window.licensePollingInterval) {
      clearInterval(window.licensePollingInterval);
      window.licensePollingInterval = null;
    }
    
    // Clear both flags
    chrome.storage.local.set({ 
      hasClickedSignup: false,
      hasClickedContinueSharing: false
    });
    
    // Now add the regular Select All checkbox and buttons
    // This requires the UI module to be available
    if (window.ShareUnlimited && window.ShareUnlimited.UI && window.ShareUnlimited.UI.addSelectAllCheckbox) {
      const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
      if (dialog) {
        console.log('✓ Adding regular UI elements...');
        window.ShareUnlimited.UI.addSelectAllCheckbox(dialog);
        
        // Also add checkboxes to groups if they're not there
        if (window.ShareUnlimited.UI.addCheckboxesToGroups) {
          window.ShareUnlimited.UI.addCheckboxesToGroups();
        }
      }
    }
    
    console.log('✓ Successfully switched to regular overlay!');
  }

  /**
   * Initializes license polling if user has previously clicked signup (new user only)
   * For expired users, just maintains the button visibility
   */
  function initializeLicensePollingIfNeeded() {
    chrome.storage.local.get(['hasClickedSignup', 'hasClickedContinueSharing', 'authExpiry'], (result) => {
      const { hasClickedSignup, hasClickedContinueSharing, authExpiry } = result;
      const isStillExpired = !authExpiry || new Date(authExpiry) <= new Date();
      
      // If user clicked signup (new user) but still doesn't have valid license, resume polling
      if (hasClickedSignup && !authExpiry) {
        console.log('Resuming license polling from previous session (new user)...');
        startLicensePolling();
      } else if (hasClickedSignup && !isStillExpired) {
        // Has valid license now, clear the flag
        chrome.storage.local.set({ hasClickedSignup: false });
      }
      
      // For expired users who clicked continue sharing, just maintain state
      // The button will show based on the flag when the UI is recreated
      if (hasClickedContinueSharing && !isStillExpired) {
        // License is now valid, clear the flag
        chrome.storage.local.set({ hasClickedContinueSharing: false });
      }
    });
  }

  // Start polling on load if needed
  initializeLicensePollingIfNeeded();

  // Export functions to global namespace
  window.ExpiredOverlay = {
    createPopupExpiredOverlay,
    removePopupExpiredOverlay,
    createFacebookExpiredButton,
    checkLicenseExpiry,
    checkAndActivateLicense,
    startLicensePolling,
    switchToRegularOverlay
  };

})();
