document.addEventListener('DOMContentLoaded', () => {
  // --- Custom Tooltip Functionality ---
  // IMMEDIATELY remove all title attributes to prevent default browser tooltips
  const removeDefaultTooltips = () => {
    document.querySelectorAll('.info-icon[title]').forEach(icon => {
      const title = icon.getAttribute('title');
      if (title && !icon.getAttribute('data-image-tooltip')) {
        icon.setAttribute('data-tooltip', title);
        icon.removeAttribute('title');
      }
    });
  };
  
  // Run immediately - don't wait!
  removeDefaultTooltips();
  
  function initializeTooltips() {
    // Make sure we've removed all title attributes first
    removeDefaultTooltips();
    
    // Create text tooltip modal (for text tooltips)
    const textTooltipModal = document.createElement('div');
    textTooltipModal.className = 'tooltip-modal hidden';
    textTooltipModal.innerHTML = `
      <div class="tooltip-modal-content text-tooltip-content">
        <button class="tooltip-close-btn">✕</button>
        <div class="tooltip-text-content"></div>
      </div>
    `;
    document.body.appendChild(textTooltipModal);
    
    const textTooltipContent = textTooltipModal.querySelector('.tooltip-text-content');
    const textTooltipCloseBtn = textTooltipModal.querySelector('.tooltip-close-btn');
    
    // Close text modal when clicking close button
    textTooltipCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      textTooltipModal.classList.add('hidden');
    });
    
    // Close text modal when clicking backdrop
    textTooltipModal.addEventListener('click', (e) => {
      if (e.target === textTooltipModal) {
        textTooltipModal.classList.add('hidden');
      }
    });
    
    // Close text modal when clicking on the text content (full click only)
    let textMouseDownTarget = null;
    textTooltipContent.addEventListener('mousedown', (e) => {
      textMouseDownTarget = e.target;
    });
    textTooltipContent.addEventListener('mouseup', (e) => {
      // Only close if mouseup is on the same element as mousedown (full click)
      if (textMouseDownTarget === e.target) {
        textTooltipModal.classList.add('hidden');
      }
      textMouseDownTarget = null;
    });
    
    // Create image tooltip modal
    const imageTooltipModal = document.createElement('div');
    imageTooltipModal.className = 'tooltip-modal hidden';
    imageTooltipModal.innerHTML = `
      <div class="tooltip-modal-content">
        <button class="tooltip-close-btn">✕</button>
        <img class="tooltip-image" src="" alt="Info">
      </div>
    `;
    document.body.appendChild(imageTooltipModal);

    const tooltipImage = imageTooltipModal.querySelector('.tooltip-image');
    const tooltipCloseBtn = imageTooltipModal.querySelector('.tooltip-close-btn');

    // Close modal when clicking close button
    tooltipCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      imageTooltipModal.classList.add('hidden');
    });

    // Close modal when clicking backdrop
    imageTooltipModal.addEventListener('click', (e) => {
      if (e.target === imageTooltipModal) {
        imageTooltipModal.classList.add('hidden');
      }
    });

    // Close modal when clicking the image itself (full click only)
    let imageMouseDownTarget = null;
    tooltipImage.addEventListener('mousedown', (e) => {
      imageMouseDownTarget = e.target;
      e.stopPropagation();
    });
    tooltipImage.addEventListener('mouseup', (e) => {
      // Only close if mouseup is on the same element as mousedown (full click)
      if (imageMouseDownTarget === e.target) {
        imageTooltipModal.classList.add('hidden');
      }
      imageMouseDownTarget = null;
      e.stopPropagation();
    });

    // Add event listeners to all info icons
    const infoIcons = document.querySelectorAll('.info-icon');
    
    infoIcons.forEach(icon => {
      const imageTooltipSrc = icon.getAttribute('data-image-tooltip');
      const tooltipText = icon.getAttribute('data-tooltip');
      
      // Set cursor to pointer for all tooltips
      icon.style.cursor = 'pointer';
      
      if (imageTooltipSrc) {
        // Image tooltip - click to open modal
        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          tooltipImage.src = imageTooltipSrc;
          imageTooltipModal.classList.remove('hidden');
        });
      } else if (tooltipText) {
        // Text tooltip - ALSO click to open modal (not hover!)
        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          textTooltipContent.textContent = tooltipText;
          textTooltipModal.classList.remove('hidden');
        });
      }
    });
  }

  // Initialize tooltips after a short delay to ensure DOM is ready
  setTimeout(initializeTooltips, 100);

  // --- Element Declarations ---

  // New Share UI
  const shareContainer = document.getElementById('share-container');
  const groupList = document.getElementById('group-list');
  const shareButton = document.getElementById('share-button');
  const refreshGroupsButton = document.getElementById('refresh-groups-button');
  const groupCount = document.getElementById('group-count');
  
  // Group Presets UI
  const groupPresetsIcon = document.getElementById('groupPresetsIcon');
  const savePresetModal = document.getElementById('save-preset-modal');
  const closeSavePresetModal = document.getElementById('close-save-preset-modal');
  const presetQuestionView = document.getElementById('preset-question-view');
  const presetFormView = document.getElementById('preset-form-view');
  const presetAnswerNo = document.getElementById('preset-answer-no');
  const presetAnswerYes = document.getElementById('preset-answer-yes');
  const presetNameInput = document.getElementById('preset-name');
  const presetGroupsCount = document.getElementById('preset-groups-count');
  const presetGroupsList = document.getElementById('preset-groups-list');
  const presetGroupsCountQuestion = document.getElementById('preset-groups-count-question');
  const presetGroupsListQuestion = document.getElementById('preset-groups-list-question');
  const cancelSavePreset = document.getElementById('cancel-save-preset');
  const confirmSavePreset = document.getElementById('confirm-save-preset');
  
  const presetsManagerModal = document.getElementById('presets-manager-modal');
  const closePresetsManager = document.getElementById('close-presets-manager');
  const presetsListContainer = document.getElementById('presets-list-container');
  const emptyPresetsState = document.querySelector('.empty-presets-state');

  // Main containers
  const mainContent = document.getElementById('main-content'); // Kept for hiding
  const settingsContainer = document.getElementById('settings-container');
  const statusDiv = document.getElementById('status');

  // Settings and Auth UI
  const settingsIcon = document.getElementById('settingsIcon');
  const addressBookIcon = document.getElementById('addressBookIcon');
  const authSection = document.getElementById('auth-section');
  const apiKeySection = document.getElementById('api-key-section');
  const signupView = document.getElementById('signup-view');
  const validationView = document.getElementById('validation-view');
  
  // API Key Section
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyButton = document.getElementById('saveApiKey');
  const getApiKeyButton = document.getElementById('getApiKey');
  const skipApiButton = document.getElementById('skipApiButton');
  const watchVideoButton = document.getElementById('watchVideoButton');
  
  // Signup View
  const emailInput = document.getElementById('email');
  const signupButton = document.getElementById('signupButton');

  // Validation View
  const validateButton = document.getElementById('validateButton');
  const getLicenseButton = document.getElementById('getLicenseButton');
  const authStatusDiv = document.getElementById('auth-status');

  // License Status View
  const licenseStatusView = document.getElementById('license-status-view');
  const licenseDetails = document.getElementById('license-details');
  const refreshLicenseButton = document.getElementById('refreshLicenseButton');
  const accountInfoButton = document.getElementById('accountInfoButton');
  const fillFormsButton = document.getElementById('fillFormsButton'); // This now acts as a "Back to Share" button

  // Settings Tabs
  const apiTabButton = document.getElementById('apiTabButton');
  const licenseTabButton = document.getElementById('licenseTabButton');
  const apiTabContent = document.getElementById('api-tab-content');
  const licenseTabContent = document.getElementById('license-tab-content');

  // --- View and Tab Management ---

  function showTab(tabName) {
    if (tabName === 'api') {
      apiTabContent.classList.remove('hidden');
      licenseTabContent.classList.add('hidden');
      apiTabButton.classList.add('active');
      licenseTabButton.classList.remove('active');
    } else if (tabName === 'license') {
      apiTabContent.classList.add('hidden');
      licenseTabContent.classList.remove('hidden');
      apiTabButton.classList.remove('active');
      licenseTabButton.classList.add('active');
      updateLicenseDetails();
    }
  }

  function showView(view) {
    // Hide all main views first
    mainContent.classList.add('hidden');
    shareContainer.classList.add('hidden');
    settingsContainer.classList.add('hidden');
    
    // Hide templates view if it exists
    const templatesView = document.getElementById('templates-view');
    if (templatesView) {
      templatesView.classList.add('hidden');
    }
    
    // Hide all settings sub-views
    authSection.classList.add('hidden');
    apiKeySection.classList.add('hidden');
    signupView.classList.add('hidden');
    validationView.classList.add('hidden');

    if (view === 'main') { // "main" now refers to the share container
      shareContainer.classList.remove('hidden');
      loadGroups(); // Attempt to load groups when showing the main view
    } else if (view === 'templates') {
      loadTemplatesView();
    } else if (view === 'settings') {
      settingsContainer.classList.remove('hidden');
      apiKeySection.classList.remove('hidden');
      showTab('api'); // Default to API tab
    } else if (view === 'signup') {
      settingsContainer.classList.remove('hidden');
      authSection.classList.remove('hidden');
      signupView.classList.remove('hidden');
    } else if (view === 'validation') {
      settingsContainer.classList.remove('hidden');
      authSection.classList.remove('hidden');
      validationView.classList.remove('hidden');
      updateValidationViewForExpiredUser();
    }
  }
  
  function loadTemplatesView() {
    // Load the CSS if not already loaded
    if (!document.getElementById('address-book-css')) {
      const link = document.createElement('link');
      link.id = 'address-book-css';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'address-book.css';
      document.head.appendChild(link);
    }
    
    // Load the JS if not already loaded and wait for it
    const loadScriptPromise = new Promise((resolve) => {
      if (!document.getElementById('address-book-js')) {
        const script = document.createElement('script');
        script.id = 'address-book-js';
        script.src = 'address-book.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      } else {
        resolve(); // Script already loaded
      }
    });
    
    Promise.all([loadScriptPromise, fetch('address-book.html')])
      .then(([_, response]) => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const container = doc.querySelector('.container');
        
        // Hide other views
        mainContent.classList.add('hidden');
        shareContainer.classList.add('hidden');
        settingsContainer.classList.add('hidden');
        
        // Get or create the templates view container
        let templatesView = document.getElementById('templates-view');
        if (!templatesView) {
          templatesView = document.createElement('div');
          templatesView.id = 'templates-view';
          document.querySelector('.wrapper').appendChild(templatesView);
        }
        
        // Set the content
        templatesView.innerHTML = container.innerHTML;
        templatesView.classList.remove('hidden');
        
        // Initialize the address book functionality after a short delay to ensure DOM is ready
        setTimeout(() => {
          if (typeof initializeAddressBook === 'function') {
            initializeAddressBook(showView);
          } else {
            console.error('initializeAddressBook function not found!');
          }
        }, 100);
      })
      .catch(error => {
        console.error('Error loading templates view:', error);
        showStatus('Error loading templates', 'error');
      });
  }

  // --- Authorization and Initial Load ---

  const checkStoredAuthCode = async () => {
    try {
      const response = await fetch('https://inventabot-proxy-backend.vercel.app/api/get-stored-auth', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.authCode) {
          // Verify the auth code contains "shareunlimited" to ensure it belongs to this extension
          if (data.authCode.toLowerCase().startsWith('shareunlimited')) {
            console.log('Found stored auth code from cookie for ShareUnlimited');
            return data.authCode;
          } else {
            console.log('Found auth code but it does not belong to ShareUnlimited extension');
            return null;
          }
        }
      }
      return null;
    } catch (error) {
      console.log('No stored auth code found in cookie:', error);
      return null;
    }
  };

  function withAuthorization(action) {
    return () => {
      chrome.storage.local.get(['authExpiry'], (result) => {
        const { authExpiry } = result;

        if (!authExpiry) {
          showStatus('Your license is not activated.', 'error');
          showView('validation');
          return;
        }

        action();
      });
    };
  }

  const performInitialLoad = async () => {
    const storedAuthCode = await checkStoredAuthCode();
    
    if (storedAuthCode) {
      console.log('Attempting to auto-authenticate from stored cookie');
      const authResponse = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'check_auth_code' }, resolve);
      });
      
      if (authResponse && authResponse.success) {
        console.log('Auto-authentication successful from cookie');
        await new Promise((resolve) => {
          chrome.storage.local.set({ 
            authExpiry: authResponse.expiry,
            uniqueInstallationId: storedAuthCode
          }, resolve);
        });
      } else if (authResponse) {
        // Check if license is expired
        const messageText = authResponse.message ? authResponse.message.toLowerCase() : '';
        const isExpired = authResponse.isExpired || messageText.includes('expired');
        
        if (isExpired) {
          console.log('Server returned expired license - updating local storage');
          // Set expired date to enforce expiration
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          await new Promise((resolve) => {
            chrome.storage.local.set({ authExpiry: yesterday.toISOString() }, resolve);
          });
        }
      }
    }

    chrome.storage.local.get(['authExpiry', 'geminiApiKey', 'signupInitiated'], (result) => {
      // [MODIFIED FOR PERSONAL USE - Developer Mode]
      // Always consider user as authorized
      let isAuthorized = true;
      
      // Set permanent expiry if not already set
      const { authExpiry, geminiApiKey, signupInitiated } = result;
      if (!authExpiry) {
        chrome.storage.local.set({ authExpiry: '2030-01-01T00:00:00.000Z' });
      }

      // Hide/show header icons based on whether user has any license record
      const headerIcons = document.querySelector('.header-icons');
      if (headerIcons) {
        headerIcons.style.display = 'flex';
      }

      // Always show main view (Developer Mode - skip signup/validation)
      showView('main');
      if (window.ExpiredOverlay) {
        window.ExpiredOverlay.removePopupExpiredOverlay();
      }
      document.body.classList.remove('hidden');
    });
  };

  performInitialLoad();

  // --- New Sharing Functionality ---

  let selectedPostVariations = [];
  
  // --- Signature Functionality ---
  const signatureToggleBtn = document.getElementById('signature-toggle-btn');
  const signatureContainer = document.getElementById('signature-container');
  const signatureTextarea = document.getElementById('signature-text');
  const signatureEnabled = document.getElementById('signature-enabled');
  const signatureSaveBtn = document.getElementById('signature-save-btn');
  
  // --- Save Post as Preset Button ---
  const savePostPresetBtn = document.getElementById('save-post-preset-btn');
  
  if (savePostPresetBtn) {
    savePostPresetBtn.addEventListener('click', () => {
      const postContent = document.getElementById('post-content').value.trim();
      
      if (!postContent) {
        showStatus('Please type a message first before saving as a preset.', 'error');
        return;
      }
      
      // Open the address book modal and fill it with the current text
      // First load the address book view
      loadTemplatesView();
      
      // Wait for the view to load, then trigger the "Add New" functionality
      setTimeout(() => {
        // If the address book has an "Add New" function, trigger it
        // and pre-fill with the current post content
        if (typeof window.addNewTemplateWithContent === 'function') {
          window.addNewTemplateWithContent(postContent);
        } else {
          // Fallback: try to find and click the add new button
          const addNewBtn = document.querySelector('#templates-view .add-btn, #templates-view button[onclick*="addNew"]');
          if (addNewBtn) {
            addNewBtn.click();
            // Try to set the content in the textarea after a short delay
            setTimeout(() => {
              const textarea = document.querySelector('#templates-view textarea');
              if (textarea) {
                textarea.value = postContent;
              }
            }, 100);
          }
        }
      }, 300);
    });
  }
  
  // Load saved signature
  chrome.storage.local.get(['postSignature', 'signatureEnabled'], (result) => {
    if (result.postSignature) {
      signatureTextarea.value = result.postSignature;
    }
    if (result.signatureEnabled !== undefined) {
      signatureEnabled.checked = result.signatureEnabled;
    }
  });
  
  // Toggle signature container
  signatureToggleBtn.addEventListener('click', () => {
    const isHidden = signatureContainer.classList.contains('hidden');
    if (isHidden) {
      signatureContainer.classList.remove('hidden');
      signatureToggleBtn.innerHTML = '<span class="signature-icon">✍️</span> Hide Signature';
      // Reinitialize tooltips for newly visible elements
      setTimeout(initializeTooltips, 50);
    } else {
      signatureContainer.classList.add('hidden');
      signatureToggleBtn.innerHTML = '<span class="signature-icon">✍️</span> Add Signature';
    }
  });
  
  // Save signature
  signatureSaveBtn.addEventListener('click', () => {
    const signatureText = signatureTextarea.value.trim();
    const isEnabled = signatureEnabled.checked;
    
    chrome.storage.local.set({
      postSignature: signatureText,
      signatureEnabled: isEnabled
    }, () => {
      showStatus('Signature saved successfully!', 'success');
      setTimeout(() => {
        if (statusDiv.textContent === 'Signature saved successfully!') {
          statusDiv.classList.add('hidden');
        }
      }, 2000);
    });
  });

  // Listen for applied variations from ai_content.js
  document.addEventListener('variationsApplied', (e) => {
    selectedPostVariations = e.detail.variations;
    console.log('Variations applied:', selectedPostVariations);
    
    const postContentArea = document.getElementById('post-content');
    if (selectedPostVariations.length > 0) {
      postContentArea.value = selectedPostVariations[0];
      postContentArea.setAttribute('placeholder', `[${selectedPostVariations.length} Variations Selected] The first one is shown here...`);
      showStatus(`${selectedPostVariations.length} variations active. First one shown.`, 'success');
    }
  });

  async function ensureContentScriptLoaded(tabId) {
    return new Promise((resolve) => {
      // Try to ping the content script
      chrome.tabs.sendMessage(tabId, { type: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not loaded, injecting...');
          // Content script not loaded, inject it
          // Inject all content script files in order
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['expired_overlay.js', 'content_core.js', 'content_ui.js', 'content_main.js']
          }, () => {
            if (chrome.runtime.lastError) {
              console.error('Failed to inject content script:', chrome.runtime.lastError);
              resolve(false);
            } else {
              console.log('Content script injected successfully');
              // Wait a moment for it to initialize
              setTimeout(() => resolve(true), 1000);
            }
          });
        } else {
          console.log('Content script already loaded');
          resolve(true);
        }
      });
    });
  }

  // Helper function to show/hide the wrong location overlay
  function updateLocationOverlay(shouldShow, hasGroups) {
    const overlay = document.getElementById('wrong-location-overlay');
    const shareContainer = document.getElementById('share-container');
    
    if (shouldShow) {
      overlay.classList.remove('hidden');
      // Blur the main content slightly
      if (shareContainer) {
        shareContainer.style.filter = 'blur(2px)';
        shareContainer.style.pointerEvents = 'none';
      }
    } else {
      overlay.classList.add('hidden');
      if (shareContainer) {
        shareContainer.style.filter = 'none';
        shareContainer.style.pointerEvents = 'auto';
      }
    }
  }

  // FIX ISSUE 2: Function to save selected groups to storage
  function saveSelectedGroups() {
    const selectedGroups = Array.from(groupList.querySelectorAll('input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);
    chrome.storage.local.set({ selectedGroups: selectedGroups }, () => {
      console.log('Saved selected groups:', selectedGroups);
    });
  }

  // FIX ISSUE 2: Function to restore selected groups from storage
  function restoreSelectedGroups() {
    chrome.storage.local.get(['selectedGroups'], (result) => {
      if (result.selectedGroups && result.selectedGroups.length > 0) {
        console.log('Restoring selected groups:', result.selectedGroups);
        const checkboxes = groupList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          if (result.selectedGroups.includes(checkbox.value)) {
            checkbox.checked = true;
          }
        });
        updateShareButtonCount(); // Update button count after restoring
      }
    });
  }

  // FIX ISSUE 4: Function to update share button text with selected count
  function updateShareButtonCount() {
    const selectedCount = groupList.querySelectorAll('input[type="checkbox"]:checked').length;
    if (selectedCount > 0) {
      shareButton.textContent = `Share to ${selectedCount} Selected Group${selectedCount > 1 ? 's' : ''}`;
    } else {
      shareButton.textContent = 'Share to Selected Groups';
    }
  }

  async function loadGroups() {
    console.log('Loading groups...');
    groupList.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p class="empty-text">Loading groups...</p></div>';
    groupCount.textContent = 'Loading...';
    
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        groupList.innerHTML = '<p>No active tab found.</p>';
        groupCount.textContent = '0 groups';
        updateLocationOverlay(true, false);
        resolve(false);
        return;
      }

      const tab = tabs[0];
      
      // Check if we're on Facebook
      if (!tab.url || !tab.url.includes('facebook.com')) {
        groupList.innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div><p class="empty-text">Not on Facebook</p><p class="empty-hint">Please navigate to Facebook.com first, then click the Refresh button.</p></div>';
        groupCount.textContent = '0 groups found';
        updateLocationOverlay(true, false);
        resolve(false);
        return;
      }

      // Ensure content script is loaded
      const scriptLoaded = await ensureContentScriptLoaded(tab.id);
      
      if (!scriptLoaded) {
        groupList.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p class="empty-text">Extension script not loaded</p><p class="empty-hint">Try refreshing the Facebook page, then click the Refresh button above.</p></div>';
        groupCount.textContent = '0 groups found';
        updateLocationOverlay(true, false);
        resolve(false);
        return;
      }

      // Now send the message to get groups
      chrome.tabs.sendMessage(tab.id, { type: 'get_groups' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error loading groups:', chrome.runtime.lastError.message);
          groupList.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p class="empty-text">No groups found yet</p><p class="empty-hint">Make sure you\'re on Facebook and click "Share" on a post, then click the Refresh button above.</p></div>';
          groupCount.textContent = '0 groups found';
          updateLocationOverlay(true, false);
          resolve(false);
          return;
        }

        console.log('Received response from content script:', response);
        
        // Log detailed response info
        if (!response) {
          console.error('❌ No response from content script');
        } else if (!response.groups) {
          console.error('❌ Response has no groups property:', response);
        } else if (response.groups.length === 0) {
          console.warn('⚠️ Response has groups array but it\'s empty');
        }

        if (response && response.groups && response.groups.length > 0) {
          // Hide overlay - user is in the right place with groups available
          updateLocationOverlay(false, true);
          console.log(`✅ Found ${response.groups.length} groups:`);
          response.groups.forEach((group, i) => {
            console.log(`  ${i + 1}. ${group.name} (checked: ${group.checked})`);
          });
          groupList.innerHTML = ''; // Clear the loading message
          groupCount.textContent = `${response.groups.length} groups found`;
          
          response.groups.forEach((group, index) => {
            console.log(`Creating group ${index + 1}:`, group.name);
            
            const div = document.createElement('div');
            div.className = 'group-item';
            console.log('Created div with class:', div.className);
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'group_' + group.name.replace(/\s/g, '_');
            checkbox.value = group.name;
            checkbox.checked = group.checked || false;
            console.log('Created checkbox:', {
              type: checkbox.type,
              id: checkbox.id,
              value: checkbox.value,
              checked: checkbox.checked
            });
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = group.name;
            console.log('Created label for:', label.htmlFor, 'with text:', label.textContent);
            
            div.appendChild(checkbox);
            div.appendChild(label);
            console.log('Appended checkbox and label to div. Div children:', div.children.length);
            
            groupList.appendChild(div);
            console.log('Appended div to groupList');
          });
          
          console.log('All groups added to UI. Total group items:', groupList.children.length);
          console.log('GroupList HTML:', groupList.innerHTML.substring(0, 500));
          
          // Force a repaint to ensure checkboxes are visible
          groupList.style.display = 'none';
          setTimeout(() => {
            groupList.style.display = '';
            
            // FIX ISSUE 2: Restore selected groups after loading
            restoreSelectedGroups();
            
            // FIX ISSUE 2: Add change listener to save selections
            const checkboxes = groupList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
              checkbox.addEventListener('change', () => {
                saveSelectedGroups();
                updateShareButtonCount(); // FIX ISSUE 4: Update button count on change
                updateToggleChosenButton(); // Update toggle button visibility
              });
            });
            
            // Update toggle button after initial load
            updateToggleChosenButton();
            
            resolve(true); // Resolve after repaint
          }, 10);
        } else {
          console.log('No groups found in response');
          groupList.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p class="empty-text">No groups found yet</p><p class="empty-hint">Make sure you\'re on Facebook and click "Share" on a post, then click the Refresh button above.</p></div>';
          groupCount.textContent = '0 groups found';
          // Show overlay - user is on Facebook but not in the right place or no groups available
          updateLocationOverlay(true, false);
          resolve(false); // Resolve with false when no groups found
        }
      });
    });
    });
  }

  // ==================== FUZZY SEARCH FUNCTIONALITY ====================
  
  const groupSearchInput = document.getElementById('group-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  
  // Simple fuzzy match function
  function fuzzyMatch(search, text) {
    if (!search) return true;
    
    search = search.toLowerCase();
    text = text.toLowerCase();
    
    // Direct substring match gets priority
    if (text.includes(search)) return true;
    
    // Fuzzy matching: check if all characters appear in order
    let searchIndex = 0;
    for (let i = 0; i < text.length && searchIndex < search.length; i++) {
      if (text[i] === search[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === search.length;
  }
  
  // Filter groups based on search query
  function filterGroups() {
    const searchQuery = groupSearchInput.value.trim();
    const groupItems = groupList.querySelectorAll('.group-item');
    let visibleCount = 0;
    
    groupItems.forEach(item => {
      const label = item.querySelector('label');
      if (!label) return;
      
      const groupName = label.textContent;
      const isMatch = fuzzyMatch(searchQuery, groupName);
      
      if (isMatch) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    // Update group count badge
    if (searchQuery) {
      groupCount.textContent = `${visibleCount} of ${groupItems.length} groups`;
    } else {
      groupCount.textContent = `${groupItems.length} groups found`;
    }
    
    // Show/hide clear button
    if (searchQuery) {
      searchClearBtn.classList.remove('hidden');
    } else {
      searchClearBtn.classList.add('hidden');
    }
    
    // Show empty state if no matches
    if (visibleCount === 0 && groupItems.length > 0) {
      const existingEmpty = groupList.querySelector('.search-empty-state');
      if (!existingEmpty) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state search-empty-state';
        emptyDiv.innerHTML = `
          <div class="empty-icon">🔍</div>
          <p class="empty-text">No groups match "${searchQuery}"</p>
          <p class="empty-hint">Try a different search term</p>
        `;
        groupList.appendChild(emptyDiv);
      }
    } else {
      // Remove search empty state if it exists
      const existingEmpty = groupList.querySelector('.search-empty-state');
      if (existingEmpty) {
        existingEmpty.remove();
      }
    }
  }
  
  // Search input event listener
  if (groupSearchInput) {
    groupSearchInput.addEventListener('input', filterGroups);
    
    // Clear search on Escape key
    groupSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        groupSearchInput.value = '';
        filterGroups();
        groupSearchInput.blur();
      }
    });
  }
  
  // Clear button event listener
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      groupSearchInput.value = '';
      filterGroups();
      groupSearchInput.focus();
    });
  }
  
  // ==================== END FUZZY SEARCH FUNCTIONALITY ====================
  
  // ==================== SHOW CHOSEN GROUPS FUNCTIONALITY ====================
  
  const toggleChosenBtn = document.getElementById('toggle-chosen-groups');
  let showingChosenOnly = false;
  
  // Function to update toggle button visibility and state
  function updateToggleChosenButton() {
    const checkboxes = groupList.querySelectorAll('input[type="checkbox"]');
    const checkedCount = groupList.querySelectorAll('input[type="checkbox"]:checked').length;
    
    // Show button if any groups are selected
    if (checkedCount > 0) {
      toggleChosenBtn.classList.remove('hidden');
    } else {
      toggleChosenBtn.classList.add('hidden');
      // Reset to show all if no groups selected
      if (showingChosenOnly) {
        showingChosenOnly = false;
        toggleChosenBtn.classList.remove('active');
        toggleChosenBtn.textContent = 'Show Chosen';
        showAllGroups();
      }
    }
  }
  
  // Function to filter and show only chosen groups
  function showChosenGroups() {
    const groupItems = groupList.querySelectorAll('.group-item');
    let chosenCount = 0;
    
    groupItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        item.style.display = 'flex';
        chosenCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    // Update group count badge
    const totalGroups = groupItems.length;
    groupCount.textContent = `${chosenCount} of ${totalGroups} groups (chosen)`;
    
    showingChosenOnly = true;
    toggleChosenBtn.classList.add('active');
    toggleChosenBtn.textContent = 'Show All';
  }
  
  // Function to show all groups
  function showAllGroups() {
    const groupItems = groupList.querySelectorAll('.group-item');
    
    groupItems.forEach(item => {
      item.style.display = 'flex';
    });
    
    // Update group count badge
    const totalGroups = groupItems.length;
    groupCount.textContent = `${totalGroups} groups found`;
    
    showingChosenOnly = false;
    toggleChosenBtn.classList.remove('active');
    toggleChosenBtn.textContent = 'Show Chosen';
  }
  
  // Toggle button click handler
  if (toggleChosenBtn) {
    toggleChosenBtn.addEventListener('click', () => {
      if (showingChosenOnly) {
        showAllGroups();
      } else {
        showChosenGroups();
      }
    });
  }
  
  // ==================== END SHOW CHOSEN GROUPS FUNCTIONALITY ====================
  
  // Select All Handler - Updated to only select visible groups
  const selectAllCheckbox = document.getElementById('select-all-groups');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      // Only select checkboxes in visible group items
      const visibleGroupItems = Array.from(groupList.querySelectorAll('.group-item'))
        .filter(item => item.style.display !== 'none');
      
      visibleGroupItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = isChecked;
        }
      });
      
      // Update toggle button and share button after selecting all
      updateToggleChosenButton();
      updateShareButtonCount();
      saveSelectedGroups();
    });
  }
  
  // Refresh button handler
  if (refreshGroupsButton) {
    refreshGroupsButton.addEventListener('click', () => {
      console.log('Manual refresh requested');
      loadGroups();
    });
  }

  // Show All Groups button handler
  const showAllGroupsButton = document.getElementById('show-all-groups-button');
  if (showAllGroupsButton) {
    showAllGroupsButton.addEventListener('click', () => {
      console.log('Show All Groups requested');
      
      // Change button state to loading
      showAllGroupsButton.classList.add('loading');
      showAllGroupsButton.textContent = '⏳ Loading...';
      showAllGroupsButton.disabled = true;
      
      showStatus('Loading all groups... This may take a moment.', 'loading');
      
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length === 0) {
          showStatus('No active tab found.', 'error');
          showAllGroupsButton.classList.remove('loading');
          showAllGroupsButton.textContent = '📋 Show All Groups';
          showAllGroupsButton.disabled = false;
          return;
        }

        const tab = tabs[0];
        
        if (!tab.url || !tab.url.includes('facebook.com')) {
          showStatus('Please navigate to Facebook first.', 'error');
          showAllGroupsButton.classList.remove('loading');
          showAllGroupsButton.textContent = '📋 Show All Groups';
          showAllGroupsButton.disabled = false;
          return;
        }

        // Send message to content script to scroll and load all groups
        chrome.tabs.sendMessage(tab.id, { type: 'show_all_groups' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError.message);
            showStatus('Error: Make sure the share dialog is open.', 'error');
            showAllGroupsButton.classList.remove('loading');
            showAllGroupsButton.textContent = '📋 Show All Groups';
            showAllGroupsButton.disabled = false;
            return;
          }

          if (response && response.success) {
            showStatus(`✓ Loaded all groups! Found ${response.totalGroups} groups.`, 'success');
            
            // Change button to success state
            showAllGroupsButton.classList.remove('loading');
            showAllGroupsButton.classList.add('loaded');
            showAllGroupsButton.textContent = '✓ All Groups Loaded';
            
            // Hide the button after a short delay
            setTimeout(() => {
              showAllGroupsButton.style.display = 'none';
            }, 2000);
            
            // Refresh the group list in the popup
            setTimeout(() => loadGroups(), 1000);
          } else {
            showStatus(response ? response.message : 'Failed to load all groups.', 'error');
            showAllGroupsButton.classList.remove('loading');
            showAllGroupsButton.textContent = '📋 Show All Groups';
            showAllGroupsButton.disabled = false;
          }
        });
      });
    });
  }

  // ==================== GROUP PRESETS FUNCTIONALITY ====================
  
  // Load and update preset count badge
  async function updatePresetsBadge() {
    const presets = await getGroupPresets();
    if (presets.length > 0) {
      groupPresetsIcon.classList.add('has-presets');
      groupPresetsIcon.setAttribute('data-preset-count', presets.length);
    } else {
      groupPresetsIcon.classList.remove('has-presets');
      groupPresetsIcon.removeAttribute('data-preset-count');
    }
  }
  
  // Get all presets from storage
  function getGroupPresets() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['groupPresets'], (result) => {
        resolve(result.groupPresets || []);
      });
    });
  }
  
  // Save presets to storage
  function saveGroupPresets(presets) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ groupPresets: presets }, resolve);
    });
  }
  
  // Show save preset modal - starts with question view
  function showSavePresetModal(selectedGroups) {
    if (selectedGroups.length === 0) {
      showStatus('Please select at least one group before saving a preset.', 'error');
      return;
    }
    
    // Show question view, hide form view
    presetQuestionView.classList.remove('hidden');
    presetFormView.classList.add('hidden');
    
    // Update preview in question view
    presetGroupsCountQuestion.textContent = `${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected`;
    presetGroupsListQuestion.innerHTML = selectedGroups.map(groupName => `
      <div class="preset-group-tag">
        <span class="group-icon">📁</span>
        <span>${groupName}</span>
      </div>
    `).join('');
    
    // Also update form view (for when user clicks Yes)
    presetGroupsCount.textContent = `${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected`;
    presetGroupsList.innerHTML = selectedGroups.map(groupName => `
      <div class="preset-group-tag">
        <span class="group-icon">📁</span>
        <span>${groupName}</span>
      </div>
    `).join('');
    
    // Clear previous input
    presetNameInput.value = '';
    
    // Show modal
    savePresetModal.classList.remove('hidden');
  }
  
  // NEW: Show update preset modal when user selection is a superset
  function showUpdatePresetModal(selectedGroups, matchedPreset) {
    if (selectedGroups.length === 0) {
      return;
    }
    
    const additionalCount = selectedGroups.length - matchedPreset.groups.length;
    const additionalGroups = selectedGroups.filter(g => !matchedPreset.groups.includes(g));
    
    // Show question view with custom messaging
    presetQuestionView.classList.remove('hidden');
    presetFormView.classList.add('hidden');
    
    // Customize the question for update scenario
    const questionTitle = document.querySelector('#preset-question-view h2');
    const questionSubtitle = document.querySelector('#preset-question-view .modal-subtitle');
    
    if (questionTitle) {
      questionTitle.textContent = `📖 Update "${matchedPreset.name}"?`;
    }
    if (questionSubtitle) {
      questionSubtitle.textContent = `You've added ${additionalCount} new group${additionalCount > 1 ? 's' : ''} to this preset. Would you like to update it or create a new preset?`;
    }
    
    // Update preview to show additional groups highlighted
    presetGroupsCountQuestion.textContent = `${selectedGroups.length} groups (+${additionalCount} new)`;
    presetGroupsListQuestion.innerHTML = selectedGroups.map(groupName => {
      const isNew = !matchedPreset.groups.includes(groupName);
      return `
        <div class="preset-group-tag" style="${isNew ? 'background: #4CAF50; color: white; font-weight: bold;' : ''}">
          <span class="group-icon">${isNew ? '🆕' : '📁'}</span>
          <span>${groupName}</span>
        </div>
      `;
    }).join('');
    
    // IMPORTANT: Also update form view (for when user clicks "Create New Preset")
    presetGroupsCount.textContent = `${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected`;
    presetGroupsList.innerHTML = selectedGroups.map(groupName => `
      <div class="preset-group-tag">
        <span class="group-icon">📁</span>
        <span>${groupName}</span>
      </div>
    `).join('');
    
    // Clear previous input
    presetNameInput.value = '';
    
    // Change button text for update scenario
    const yesButton = document.getElementById('preset-answer-yes');
    const noButton = document.getElementById('preset-answer-no');
    
    if (yesButton) {
      yesButton.textContent = `✓ Update "${matchedPreset.name}"`;
      yesButton.onclick = async () => {
        // Update the preset with new groups
        await updateExistingPreset(matchedPreset.id, selectedGroups);
        hideSavePresetModal();
        // Reset button text
        yesButton.textContent = '✓ Yes, Save It!';
        yesButton.onclick = null;
      };
    }
    
    if (noButton) {
      noButton.textContent = '➕ Create New Preset';
      noButton.onclick = (e) => {
        e.stopImmediatePropagation(); // Prevent other handlers from firing
        
        // Reset modal to default state first
        if (questionTitle) questionTitle.textContent = '📖 Save as Group Preset?';
        if (questionSubtitle) questionSubtitle.textContent = 'Would you like to save this group selection for later use?';
        if (yesButton) {
          yesButton.textContent = '✓ Yes, Save It!';
          yesButton.onclick = null;
        }
        noButton.textContent = 'No, thanks';
        noButton.onclick = null;
        
        // Show the form to create a new preset instead
        showPresetFormView();
      };
    }
    
    // Show modal
    savePresetModal.classList.remove('hidden');
  }
  
  // Update an existing preset with new groups
  async function updateExistingPreset(presetId, newGroups) {
    const presets = await getGroupPresets();
    const presetIndex = presets.findIndex(p => p.id === presetId);
    
    if (presetIndex === -1) {
      showStatus('Preset not found.', 'error');
      return;
    }
    
    // Update the preset
    presets[presetIndex].groups = newGroups;
    presets[presetIndex].updatedAt = new Date().toISOString();
    
    await saveGroupPresets(presets);
    await updatePresetsBadge();
    
    showStatus(`✓ Updated preset "${presets[presetIndex].name}" with ${newGroups.length} groups!`, 'success');
  }
  
  // Switch to form view (when user clicks Yes)
  function showPresetFormView() {
    presetQuestionView.classList.add('hidden');
    presetFormView.classList.remove('hidden');
    presetNameInput.focus();
  }
  
  // Hide save preset modal
  function hideSavePresetModal() {
    savePresetModal.classList.add('hidden');
    
    // Reset modal to default state
    const questionTitle = document.querySelector('#preset-question-view h2');
    const questionSubtitle = document.querySelector('#preset-question-view .modal-subtitle');
    const yesButton = document.getElementById('preset-answer-yes');
    const noButton = document.getElementById('preset-answer-no');
    
    if (questionTitle) questionTitle.textContent = '📖 Save as Group Preset?';
    if (questionSubtitle) questionSubtitle.textContent = 'Would you like to save this group selection for later use?';
    if (yesButton) {
      yesButton.textContent = '✓ Yes, Save It!';
      yesButton.onclick = null;
    }
    if (noButton) {
      noButton.textContent = 'No, thanks';
      noButton.onclick = null;
    }
  }
  
  // Save the preset
  async function saveNewPreset() {
    const presetName = presetNameInput.value.trim();
    
    if (!presetName) {
      showStatus('Please enter a name for this preset.', 'error');
      presetNameInput.focus();
      return;
    }
    
    const selectedGroups = Array.from(groupList.querySelectorAll('input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);
    
    if (selectedGroups.length === 0) {
      showStatus('No groups selected.', 'error');
      hideSavePresetModal();
      return;
    }
    
    // Get existing presets
    const presets = await getGroupPresets();
    
    // Check for duplicate name
    if (presets.some(p => p.name === presetName)) {
      if (!confirm(`A preset named "${presetName}" already exists. Replace it?`)) {
        return;
      }
      // Remove old preset with same name
      const filteredPresets = presets.filter(p => p.name !== presetName);
      presets.length = 0;
      presets.push(...filteredPresets);
    }
    
    // Create new preset
    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      groups: selectedGroups,
      createdAt: new Date().toISOString()
    };
    
    presets.push(newPreset);
    await saveGroupPresets(presets);
    
    // Update badge
    await updatePresetsBadge();
    
    showStatus(`✓ Preset "${presetName}" saved successfully!`, 'success');
    hideSavePresetModal();
  }
  
  // Show presets manager modal
  async function showPresetsManager() {
    const presets = await getGroupPresets();
    
    if (presets.length === 0) {
      presetsListContainer.classList.add('hidden');
      emptyPresetsState.classList.remove('hidden');
    } else {
      presetsListContainer.classList.remove('hidden');
      emptyPresetsState.classList.add('hidden');
      
      // Render presets
      presetsListContainer.innerHTML = presets.map(preset => {
        const createdDate = new Date(preset.createdAt).toLocaleDateString();
        return `
          <div class="preset-card" data-preset-id="${preset.id}">
            <div class="preset-card-header">
              <div class="preset-name-display">
                <span class="preset-emoji">📖</span>
                <span>${preset.name}</span>
              </div>
              <div class="preset-actions-row">
                <button class="preset-action-btn preset-apply-btn" data-action="apply" data-preset-id="${preset.id}">
                  ✓ Apply
                </button>
                <button class="preset-action-btn preset-delete-btn" data-action="delete" data-preset-id="${preset.id}">
                  🗑️
                </button>
              </div>
            </div>
            <div class="preset-card-body">
              <div class="preset-info-row">
                <span class="preset-info-icon">🎯</span>
                <span>${preset.groups.length} group${preset.groups.length > 1 ? 's' : ''}</span>
              </div>
              <div class="preset-info-row">
                <span class="preset-info-icon">📅</span>
                <span>Created: ${createdDate}</span>
              </div>
              <div class="preset-groups-preview-mini">
                ${preset.groups.map(g => `<span class="preset-group-chip">${g}</span>`).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      // Add event listeners
      document.querySelectorAll('.preset-action-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          const presetId = btn.getAttribute('data-preset-id');
          
          if (action === 'apply') {
            await applyPreset(presetId);
          } else if (action === 'delete') {
            await deletePreset(presetId);
          }
        });
      });
    }
    
    presetsManagerModal.classList.remove('hidden');
  }
  
  // Hide presets manager modal
  function hidePresetsManager() {
    presetsManagerModal.classList.add('hidden');
  }
  
  // Apply a preset (select groups)
  async function applyPreset(presetId) {
    const presets = await getGroupPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
      showStatus('Preset not found.', 'error');
      return;
    }
    
    // Mark the card as applying
    const card = document.querySelector(`.preset-card[data-preset-id="${presetId}"]`);
    if (card) {
      card.classList.add('applying');
    }
    
    // Close the modal
    hidePresetsManager();
    
    // IMMEDIATELY scroll to the Share button (before loading groups)
    setTimeout(() => {
      const shareButton = document.getElementById('share-button');
      if (shareButton) {
        shareButton.scrollIntoView({ behavior: 'smooth', block: 'end' });
        console.log('✓ Immediately scrolled to Share button area');
      }
    }, 100); // Very short delay just to let modal close
    
    // Show prominent loading message in status bar
    showStatus('⏳ Loading all groups... This may take up to 20 seconds.', 'loading');
    
    // Show loading indicator in the group list area
    groupList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" style="font-size: 48px; animation: spin 2s linear infinite;">⏳</div>
        <p class="empty-text" style="font-size: 18px; font-weight: bold;">Loading All Groups...</p>
        <p class="empty-hint">This may take up to 20 seconds. Please wait...</p>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
    
    // First, ensure "Show All Groups" is triggered to load all groups
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        showStatus('No active tab found.', 'error');
        return;
      }

      const tab = tabs[0];
      
      if (!tab.url || !tab.url.includes('facebook.com')) {
        showStatus('Please navigate to Facebook first.', 'error');
        return;
      }

      // Send message to content script to scroll and load all groups
      chrome.tabs.sendMessage(tab.id, { type: 'show_all_groups' }, async (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError.message);
          showStatus('Error: Make sure the share dialog is open.', 'error');
          return;
        }

        if (response && response.success) {
          console.log(`✓ Show All Groups completed. Total groups: ${response.totalGroups}`);
          showStatus('⏳ Refreshing group list in popup...', 'loading');
          
          // Wait longer for Facebook to finish loading groups
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Refresh the group list in the popup and wait for completion
          showStatus('⏳ Building group list...', 'loading');
          const groupsLoaded = await loadGroups();
          
          if (!groupsLoaded) {
            showStatus('❌ Failed to load groups. Please try again.', 'error');
            return;
          }
          
          // Extra wait to ensure DOM is fully rendered
          showStatus('⏳ Selecting preset groups...', 'loading');
          
          // Use requestAnimationFrame to ensure DOM is painted
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setTimeout(resolve, 100);
              });
            });
          });
          
          // Now select the groups from the preset
          console.log(`\n=== APPLYING PRESET "${preset.name}" ===`);
          console.log(`Preset ID: ${preset.id}`);
          console.log(`Preset object:`, JSON.stringify(preset, null, 2));
          console.log(`Preset contains ${preset.groups.length} groups:`, preset.groups);
          console.log(`Type of preset.groups:`, typeof preset.groups, Array.isArray(preset.groups));
          
          const checkboxes = groupList.querySelectorAll('input[type="checkbox"]');
          console.log(`Found ${checkboxes.length} checkboxes in the UI`);
          
          // Debug: Log all checkbox values
          const allCheckboxValues = Array.from(checkboxes).map(cb => cb.value);
          console.log('All checkbox values (first 5):', allCheckboxValues.slice(0, 5));
          console.log('All checkbox values (full):', allCheckboxValues);
          
          // Check if there's any overlap
          const matches = allCheckboxValues.filter(cbValue => preset.groups.includes(cbValue));
          console.log(`\nDirect comparison - Found ${matches.length} matches:`, matches);
          
          let matchedCount = 0;
          
          checkboxes.forEach((checkbox, index) => {
            const isInPreset = preset.groups.includes(checkbox.value);
            console.log(`Checkbox ${index + 1}: "${checkbox.value}" - ${isInPreset ? 'MATCH ✓' : 'no match'}`);
            
            if (isInPreset) {
              checkbox.checked = true;
              matchedCount++;
              console.log(`  → Set checkbox.checked = true for: ${checkbox.value}`);
              
              // Double-check it was set
              setTimeout(() => {
                console.log(`  → Verify: checkbox.checked is now ${checkbox.checked}`);
              }, 50);
            } else {
              checkbox.checked = false;
            }
          });
          
          console.log(`\n=== SELECTION SUMMARY ===`);
          console.log(`Matched and checked: ${matchedCount} of ${preset.groups.length} preset groups`);
          console.log(`============================\n`);
          
          // Update UI elements after selection
          updateToggleChosenButton();
          updateShareButtonCount();
          saveSelectedGroups();
          
          // Automatically show only chosen groups after applying preset
          if (matchedCount > 0) {
            setTimeout(() => {
              showChosenGroups();
            }, 100);
          }
          
          // Check if no matches were found
          if (matchedCount === 0) {
            console.warn('⚠️ No matches found! User may be on a different Facebook account.');
            showStatus(`⚠️ No groups matched preset "${preset.name}"`, 'error');
            
            // Show alert to user
            setTimeout(() => {
              alert(
                `⚠️ Account Mismatch Detected\n\n` +
                `None of the ${preset.groups.length} groups in the preset "${preset.name}" were found in your current Facebook account.\n\n` +
                `This preset may have been created on a different Facebook account.\n\n` +
                `Please switch to the correct Facebook account and try again, or delete this preset if it's no longer needed.`
              );
            }, 500);
          } else if (matchedCount < preset.groups.length) {
            // Partial match - some groups found but not all
            console.log(`✓ Selection complete: ${matchedCount} of ${preset.groups.length} groups matched and checked`);
            showStatus(`⚠️ Applied preset "${preset.name}" - Only ${matchedCount} of ${preset.groups.length} groups found`, 'success');
            
            // Show a less alarming message for partial matches
            setTimeout(() => {
              const missingCount = preset.groups.length - matchedCount;
              if (confirm(
                `Partial Match\n\n` +
                `Found ${matchedCount} of ${preset.groups.length} groups from preset "${preset.name}".\n\n` +
                `${missingCount} group${missingCount > 1 ? 's were' : ' was'} not found in your current account.\n\n` +
                `Click OK to see which groups are missing, or Cancel to continue.`
              )) {
                const missingGroups = preset.groups.filter(g => !allCheckboxValues.includes(g));
                alert(`Missing Groups:\n\n${missingGroups.join('\n')}`);
              }
            }, 500);
          } else {
            // Perfect match - all groups found
            console.log(`✓ Selection complete: ${matchedCount} of ${preset.groups.length} groups matched and checked`);
            showStatus(`✓ Applied preset "${preset.name}" - ${matchedCount} of ${preset.groups.length} groups selected!`, 'success');
          }
          
          // Automatically scroll to the Share button after applying preset
          setTimeout(() => {
            const shareButton = document.getElementById('share-button');
            if (shareButton) {
              shareButton.scrollIntoView({ behavior: 'smooth', block: 'end' });
              console.log('✓ Auto-scrolled to Share button');
            }
          }, 500); // Small delay to ensure DOM is fully updated
        } else {
          showStatus(response ? response.message : 'Failed to load all groups.', 'error');
        }
      });
    });
  }
  
  // Delete a preset
  async function deletePreset(presetId) {
    const presets = await getGroupPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
      return;
    }
    
    if (!confirm(`Delete preset "${preset.name}"?`)) {
      return;
    }
    
    const updatedPresets = presets.filter(p => p.id !== presetId);
    await saveGroupPresets(updatedPresets);
    
    // Update badge
    await updatePresetsBadge();
    
    // Refresh the manager modal
    await showPresetsManager();
    
    showStatus(`Preset "${preset.name}" deleted.`, 'success');
  }
  
  // Event Listeners for Presets
  if (groupPresetsIcon) {
    groupPresetsIcon.addEventListener('click', showPresetsManager);
  }
  
  if (closeSavePresetModal) {
    closeSavePresetModal.addEventListener('click', hideSavePresetModal);
  }
  
  // Set default onclick handlers (can be overridden by showUpdatePresetModal)
  if (presetAnswerNo) {
    presetAnswerNo.onclick = hideSavePresetModal;
  }
  
  if (presetAnswerYes) {
    presetAnswerYes.onclick = showPresetFormView;
  }
  
  if (cancelSavePreset) {
    cancelSavePreset.addEventListener('click', hideSavePresetModal);
  }
  
  if (confirmSavePreset) {
    confirmSavePreset.addEventListener('click', saveNewPreset);
  }
  
  if (closePresetsManager) {
    closePresetsManager.addEventListener('click', hidePresetsManager);
  }
  
  // Close modals when clicking outside
  savePresetModal.addEventListener('click', (e) => {
    if (e.target === savePresetModal) {
      hideSavePresetModal();
    }
  });
  
  presetsManagerModal.addEventListener('click', (e) => {
    if (e.target === presetsManagerModal) {
      hidePresetsManager();
    }
  });
  
  // Initialize badge on load
  updatePresetsBadge();
  
  // ==================== END GROUP PRESETS FUNCTIONALITY ====================
  
  // ==================== ONE CLICK TEMPLATES INITIALIZATION ====================
  
  // Initialize One Click Templates after a short delay to ensure DOM is ready
  setTimeout(() => {
    if (typeof initializeOneClickTemplates === 'function') {
      initializeOneClickTemplates(showView);
      console.log('✓ One Click Templates initialized');
    } else {
      console.error('initializeOneClickTemplates function not found!');
    }
  }, 200);
  
  // ==================== END ONE CLICK TEMPLATES INITIALIZATION ====================
  
  // ==================== VIDEO TUTORIAL FUNCTIONALITY ====================
  
  // Tutorial button on splash screen - opens tutorial page
  const tutorialButton = document.getElementById('tutorial-button');
  if (tutorialButton) {
    tutorialButton.addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.tabs.create({ url: 'https://mgsa.lovable.app/tutorial' });
    });
  }
  
  // Tutorial button in settings - opens tutorial page
  const settingsWatchTutorial = document.getElementById('settings-watch-tutorial');
  if (settingsWatchTutorial) {
    settingsWatchTutorial.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://mgsa.lovable.app/tutorial' });
    });
  }
  
  // ==================== END VIDEO TUTORIAL FUNCTIONALITY ====================

  shareButton.addEventListener('click', withAuthorization(() => {
    const selectedGroups = Array.from(groupList.querySelectorAll('input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);

    // Get Delay
    const delayInput = document.getElementById('share-delay');
    let delaySeconds = parseInt(delayInput.value, 10);
    if (isNaN(delaySeconds) || delaySeconds < 5) {
      delaySeconds = 5;
      delayInput.value = 5;
    }

    const randomizeDelay = document.getElementById('randomize-delay').checked;

    if (selectedGroups.length === 0) {
      showStatus('Please select at least one group.', 'error');
      return;
    }

    // FIX ISSUE 3: Check if this is first time user is sharing
    chrome.storage.local.get(['hasSharedBefore'], (result) => {
      if (!result.hasSharedBefore) {
        // First time user - show notification
        const message = `⚠️ FIRST TIME USERS: If you just added this extension, please REFRESH your Facebook page if you see any issues. After the first time, there won't be any issues again.`;
        
        const shouldContinue = confirm(message);
        
        if (shouldContinue) {
          // Mark that user has shared before
          chrome.storage.local.set({ hasSharedBefore: true }, () => {
            console.log('First-time share notification shown and acknowledged');
            proceedWithShare();
          });
        } else {
          return; // User cancelled
        }
      } else {
        // Not first time - proceed normally
        proceedWithShare();
      }
    });

    // Function to handle the actual sharing logic
    function proceedWithShare() {
      // Get the post content from the textarea
      const postContent = document.getElementById('post-content').value.trim();
    
    // Get signature settings
    chrome.storage.local.get(['postSignature', 'signatureEnabled'], (signatureResult) => {
      const signature = signatureResult.signatureEnabled && signatureResult.postSignature 
        ? signatureResult.postSignature.trim() 
        : null;
      
      // If user edited the textarea manually after selecting variations, we should probably
      // respect their edit OR warn them.
      // Strategy: If postContent matches the first variation, we assume they kept the variations.
      // If it's different, we assume they want to send just this single edited content.
      // BUT simpler strategy for now: If we have variations, use them.
      
      let contentToSend = postContent;
      let variationsToSend = null;

      if (selectedPostVariations.length > 0 && postContent === selectedPostVariations[0]) {
        // User hasn't changed the first variation, so we assume they want to use the full list
        variationsToSend = selectedPostVariations;
        console.log('Using AI variations:', variationsToSend.length);
      } else if (selectedPostVariations.length > 0) {
        console.log('User modified the content manually, ignoring other variations.');
        selectedPostVariations = []; // Reset
      }

      // Show progress bar
      const progressContainer = document.getElementById('progress-container');
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      const progressCount = document.getElementById('progress-count');
      
      progressContainer.classList.remove('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = 'Starting...';
      progressCount.textContent = `0/${selectedGroups.length}`;
      
      showStatus(`Sharing to ${selectedGroups.length} groups...`, 'loading');
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
              chrome.tabs.sendMessage(tabs[0].id, { 
                type: 'share_to_groups', 
                groups: selectedGroups,
                postContent: postContent,
                postVariations: variationsToSend,
                postSignature: signature,
                delay: delaySeconds,
                randomizeDelay: randomizeDelay
              }, (response) => {
                  if (response && response.success) {
                      // Complete the progress bar
                      progressBar.style.width = '100%';
                      progressText.textContent = 'Complete! ✓';
                      progressCount.textContent = `${selectedGroups.length}/${selectedGroups.length}`;
                      
                      showStatus('Successfully shared to all selected groups!', 'success');
                      
                      // Hide progress bar after 3 seconds
                      setTimeout(() => {
                          progressContainer.classList.add('hidden');
                      }, 3000);
                  } else {
                      showStatus('An error occurred during sharing.', 'error');
                      progressContainer.classList.add('hidden');
                  }
              });
          }
      });
      
      // NEW: Show save preset modal DURING sharing (non-blocking)
      // This allows sharing to continue while user decides whether to save
      // Check if exact duplicate OR if it's a superset of an existing preset
      if (selectedGroups.length > 1) { // Only ask if multiple groups selected
        setTimeout(async () => {
          const presets = await getGroupPresets();
          
          // Check if this exact combination already exists
          const exactMatch = presets.find(preset => {
            // Compare sorted arrays to check if groups are identical
            const presetGroupsSorted = [...preset.groups].sort();
            const selectedGroupsSorted = [...selectedGroups].sort();
            
            if (presetGroupsSorted.length !== selectedGroupsSorted.length) {
              return false;
            }
            
            return presetGroupsSorted.every((group, index) => group === selectedGroupsSorted[index]);
          });
          
          if (exactMatch) {
            console.log('Identical preset already exists, skipping save prompt');
            return;
          }
          
          // Check if selected groups is a SUPERSET of any existing preset
          // (contains all groups from a preset + additional groups)
          const supersetMatch = presets.find(preset => {
            // Selected must have more groups than preset
            if (selectedGroups.length <= preset.groups.length) {
              return false;
            }
            
            // Check if ALL preset groups are contained in selected groups
            return preset.groups.every(presetGroup => selectedGroups.includes(presetGroup));
          });
          
          if (supersetMatch) {
            // Found a preset that is fully contained in current selection
            const additionalCount = selectedGroups.length - supersetMatch.groups.length;
            console.log(`Found superset match with preset "${supersetMatch.name}". ${additionalCount} additional groups.`);
            showUpdatePresetModal(selectedGroups, supersetMatch);
          } else {
            // No match, show regular save modal
            showSavePresetModal(selectedGroups);
          }
        }, 2000); // Wait 2 seconds after sharing starts
      }
    }); // Close chrome.storage.local.get callback for signature
    } // Close proceedWithShare function
  }));

  // Listen for progress updates from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'share_progress') {
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      const progressCount = document.getElementById('progress-count');
      
      const percentage = (request.current / request.total) * 100;
      progressBar.style.width = percentage + '%';
      progressText.textContent = `Sharing to ${request.groupName}...`;
      progressCount.textContent = `${request.current}/${request.total}`;
    }
  });

  // --- Settings and Auth Event Listeners (Mostly Unchanged) ---

  // Address Book Icon Handler
  if (addressBookIcon) {
    addressBookIcon.addEventListener('click', () => {
      showView('templates');
    });
  }

  settingsIcon.addEventListener('click', () => {
    chrome.storage.local.get(['authExpiry', 'geminiApiKey', 'signupInitiated'], (result) => {
      const { authExpiry, geminiApiKey, signupInitiated } = result;
      let isAuthorized = authExpiry && new Date(authExpiry) > new Date();

      if (!shareContainer.classList.contains('hidden')) { // If we are on the main share view
        if (isAuthorized) {
          if (geminiApiKey && apiKeyInput) {
            apiKeyInput.value = geminiApiKey;
          }
          showView('settings');
        } else if (signupInitiated) {
          showView('validation');
        } else {
          showView('signup');
        }
      } else { // If we are in settings, go back to main view
        if (isAuthorized) {
          showView('main');
        }
      }
    });
  });

  signupButton.addEventListener('click', () => {
    const firstNameInput = document.getElementById('firstName');
    const firstName = firstNameInput ? firstNameInput.value.trim() : '';
    const email = emailInput.value.trim();
    
    if (!firstName) {
      showStatus('Please enter your first name.', 'error', true);
      return;
    }
    
    if (!email || !email.includes('@')) {
      showStatus('Please enter a valid email address.', 'error', true);
      return;
    }
    
    chrome.runtime.sendMessage({ type: 'get_installation_id' }, (response) => {
      const installationId = response.installationId;
      const signupUrl = `http://inventabot.com/software/shareunlimited?auth=${installationId}&email=${email}&name=${encodeURIComponent(firstName)}`;
      chrome.tabs.create({ url: signupUrl });
      chrome.storage.local.set({ signupInitiated: true, userEmail: email, userName: firstName }, () => {
        showView('validation');
      });
    });
  });

  validateButton.addEventListener('click', () => {
    showStatus('Validating license...', 'loading', true);
    chrome.runtime.sendMessage({ type: 'check_auth_code' }, (response) => {
      if (response && response.success) {
        chrome.storage.local.set({ authExpiry: response.expiry }, () => {
          showStatus(`✔️ You have ${response.daysRemaining} days to use this app.`, 'success', true);
          setTimeout(() => chrome.runtime.reload(), 1500);
        });
      } else {
        // Check if the error message indicates an expired license
        const message = response ? response.message : 'Validation failed.';
        const isExpiredMessage = message && message.toLowerCase().includes('expired');
        
        if (isExpiredMessage) {
          // Set an expired authExpiry (yesterday) to mark user as having an expired license
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          chrome.storage.local.set({ authExpiry: yesterday.toISOString() }, () => {
            showStatus('Your license has expired.', 'error', true);
            // Refresh the validation view to show expired modal
            updateValidationViewForExpiredUser();
          });
        } else {
          showStatus(message, 'error', true);
        }
      }
    });
  });

  if (skipApiButton) {
    skipApiButton.addEventListener('click', () => {
      showView('main');
    });
  }
  
  if (saveApiKeyButton) {
    saveApiKeyButton.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      if (apiKey) {
        chrome.storage.local.set({ 'geminiApiKey': apiKey }, () => {
          showStatus('API Key saved successfully! Reloading...', 'success');
          setTimeout(() => chrome.runtime.reload(), 1500);
        });
      } else {
        showStatus('Please enter a valid API key.', 'error');
      }
    });
  }

  if (fillFormsButton) {
    fillFormsButton.addEventListener('click', () => showView('main')); // Re-purposed to go back to the main share view
  }
  
  if (getApiKeyButton) {
    getApiKeyButton.addEventListener('click', () => chrome.tabs.create({ url: 'https://aistudio.google.com/app/apikey' }));
  }
  
  if (watchVideoButton) {
    watchVideoButton.addEventListener('click', () => chrome.tabs.create({ url: 'https://mgsa.lovable.app/tutorial' }));
  }
  
  // Debug: Check if button exists
  console.log('getLicenseButton element:', getLicenseButton);
  console.log('getLicenseButton exists?', !!getLicenseButton);
  
  if (getLicenseButton) {
    console.log('Attaching click listener to getLicenseButton');
    getLicenseButton.addEventListener('click', () => {
      console.log('Get License button clicked');
    chrome.storage.local.get(['authExpiry', 'userEmail', 'userName', 'uniqueInstallationId'], (result) => {
      const { authExpiry, userEmail, userName, uniqueInstallationId } = result;
      
      console.log('Storage values:', { 
        authExpiry, 
        userEmail, 
        userName,
        uniqueInstallationId,
        hasExpiry: !!authExpiry,
        isExpired: authExpiry ? new Date(authExpiry) < new Date() : false
      });
      
      // Check if user has an expired license (has authExpiry in the past)
      const hasExpiredLicense = authExpiry && new Date(authExpiry) < new Date();
      
      if (hasExpiredLicense && userEmail) {
        console.log('Detected expired license, opening renewal page');
        // User has expired license - open renewal page
        // Try to use stored installation ID first, fallback to requesting it
        if (uniqueInstallationId) {
          console.log('Using stored installation ID:', uniqueInstallationId);
          const renewUrl = `http://inventabot.com/software/shareunlimited?auth=${uniqueInstallationId}&email=${userEmail}${userName ? '&name=' + encodeURIComponent(userName) : ''}`;
          console.log('Opening URL:', renewUrl);
          chrome.tabs.create({ url: renewUrl });
        } else {
          console.log('No stored installation ID, requesting from background');
          chrome.runtime.sendMessage({ type: 'get_installation_id' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error getting installation ID:', chrome.runtime.lastError);
              return;
            }
            console.log('Received installation ID:', response);
            const installationId = response.installationId;
            const renewUrl = `http://inventabot.com/software/shareunlimited?auth=${installationId}&email=${userEmail}${userName ? '&name=' + encodeURIComponent(userName) : ''}`;
            console.log('Opening URL:', renewUrl);
            chrome.tabs.create({ url: renewUrl });
          });
        }
      } else {
        console.log('No expired license detected, showing signup view');
        // New user - show signup view
        showView('signup');
      }
    });
    });
  } else {
    console.error('getLicenseButton not found in DOM!');
  }
  
  if (apiTabButton) {
    apiTabButton.addEventListener('click', () => showTab('api'));
  }
  
  if (licenseTabButton) {
    licenseTabButton.addEventListener('click', () => showTab('license'));
  }
  
  if (refreshLicenseButton) {
    refreshLicenseButton.addEventListener('click', () => {
    licenseDetails.textContent = 'Refreshing...';
    chrome.runtime.sendMessage({ type: 'check_auth_code' }, (response) => {
      if (response && response.success) {
        // License is valid - update the expiry and display
        chrome.storage.local.set({ authExpiry: response.expiry }, () => {
          updateLicenseDetails();
          showStatus('License refreshed successfully!', 'success');
        });
      } else {
        // License check failed or expired
        const messageText = response && response.message ? response.message.toLowerCase() : '';
        const isExpiredResponse = response && (response.isExpired || messageText.includes('expired'));
        
        if (isExpiredResponse) {
          // License is explicitly expired - set authExpiry to yesterday to enforce expiration
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          chrome.storage.local.set({ authExpiry: yesterday.toISOString() }, () => {
            // After updating storage, refresh the display
            updateLicenseDetails();
          });
        } else if (response && response.expiry) {
          // Response includes expiry info - update storage with it
          chrome.storage.local.set({ authExpiry: response.expiry }, () => {
            updateLicenseDetails();
          });
        } else {
          // No expiry in response - just show the message directly
          if (response && response.message) {
            licenseDetails.textContent = response.message;
          } else {
            licenseDetails.textContent = 'Could not refresh license status. Please try again.';
          }
        }
      }
    });
    });
  }
  
  if (accountInfoButton) {
    accountInfoButton.addEventListener('click', () => {
    chrome.storage.local.get(['userEmail'], (result) => {
      if (result.userEmail) {
        chrome.runtime.sendMessage({ type: 'get_installation_id' }, (response) => {
          const installationId = response.installationId;
          const accountUrl = `http://inventabot.com/software/shareunlimited?auth=${installationId}&email=${result.userEmail}`;
          chrome.tabs.create({ url: accountUrl });
        });
      } else {
        showView('signup');
      }
    });
    });
  }


  // --- Utility Functions ---

  function updateLicenseDetails() {
    // [MODIFIED FOR PERSONAL USE - Developer Mode]
    // Always show permanent license active
    licenseDetails.textContent = 'Permanent License Active (Developer Mode - Expires: January 1, 2030)';
  }

  function updateValidationViewForExpiredUser() {
    chrome.storage.local.get(['authExpiry'], (result) => {
      const { authExpiry } = result;
      const hasExpiredLicense = authExpiry && new Date(authExpiry) < new Date();
      
      // Get the validation view elements
      const validationTitle = validationView.querySelector('h2');
      const validationText = validationView.querySelector('p');
      
      if (hasExpiredLicense) {
        // User has an expired license - check for updates automatically
        console.log('Expired license detected - checking backend for updates...');
        
        // Update UI to show checking status
        if (validationTitle) {
          validationTitle.textContent = 'Checking License Status...';
        }
        if (validationText) {
          validationText.textContent = 'Please wait while we verify your license...';
        }
        
        // Automatically check if license has been renewed
        chrome.runtime.sendMessage({ type: 'check_auth_code' }, (response) => {
          if (response && response.success) {
            console.log('License has been renewed! Reloading...');
            // License is now valid - update storage and reload
            chrome.storage.local.set({ authExpiry: response.expiry }, () => {
              showStatus(`✔️ Welcome back! You have ${response.daysRemaining} days remaining.`, 'success', true);
              setTimeout(() => chrome.runtime.reload(), 1500);
            });
          } else {
            console.log('License still expired');
            // Still expired - show friendly expired message
            if (validationTitle) {
              validationTitle.textContent = 'Glad you tried MGSA!';
            }
            if (validationText) {
              validationText.textContent = 'Want to continue sharing in 1 click? Extend your license today!';
            }
            if (getLicenseButton) {
              getLicenseButton.textContent = 'Extend Your License Today! ✨';
              getLicenseButton.classList.remove('secondary');
              getLicenseButton.classList.add('primary');
            }
            if (validateButton) {
              validateButton.style.display = 'none';
            }
          }
        });
      } else {
        // New user who hasn't signed up yet
        if (validationTitle) {
          validationTitle.textContent = 'Validate Your License';
        }
        if (validationText) {
          validationText.textContent = 'After signing up, click the button below to validate your license.';
        }
        if (getLicenseButton) {
          getLicenseButton.textContent = 'Get a License';
          getLicenseButton.classList.remove('primary');
          getLicenseButton.classList.add('secondary');
        }
        if (validateButton) {
          validateButton.style.display = '';
        }
      }
    });
  }

  function showStatus(message, type, isAuthStatus = false) {
    const targetDiv = isAuthStatus ? authStatusDiv : statusDiv;
    if (targetDiv) {
      targetDiv.textContent = message;
      targetDiv.className = `status ${type}`;
      targetDiv.classList.remove('hidden');
    }
  }
});
