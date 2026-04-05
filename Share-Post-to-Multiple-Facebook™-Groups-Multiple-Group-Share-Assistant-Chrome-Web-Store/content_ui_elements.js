// content_ui_elements.js - In-page UI elements (buttons, checkboxes)
(function() {
  'use strict';

  // Initialize Namespace
  window.ShareUnlimited = window.ShareUnlimited || {};
  window.ShareUnlimited.UI = window.ShareUnlimited.UI || {};
  
  const UI = window.ShareUnlimited.UI;
  // Core will be available as window.ShareUnlimited.Core

  // --- Checkbox Selection Persistence ---
  
  /**
   * Saves the current checkbox selections to sessionStorage
   */
  function saveCheckboxSelections() {
    const selections = {};
    document.querySelectorAll('.multi-share-checkbox').forEach(checkbox => {
      const button = checkbox.closest('div[role="button"]');
      if (button && window.ShareUnlimited.Core) {
        const buttonText = button.textContent.trim();
        const groupName = window.ShareUnlimited.Core.extractAndValidateGroupName(buttonText);
        if (groupName) {
          selections[groupName] = checkbox.checked;
        }
      }
    });
    sessionStorage.setItem('shareUnlimited_checkboxSelections', JSON.stringify(selections));
    console.log('💾 Saved checkbox selections:', Object.keys(selections).filter(k => selections[k]).length, 'selected');
  }

  /**
   * Loads checkbox selections from sessionStorage
   */
  function loadCheckboxSelections() {
    const saved = sessionStorage.getItem('shareUnlimited_checkboxSelections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved selections:', e);
      }
    }
    return {};
  }

  /**
   * Clears saved checkbox selections
   */
  function clearCheckboxSelections() {
    sessionStorage.removeItem('shareUnlimited_checkboxSelections');
    console.log('🗑️ Cleared checkbox selections');
  }

  /**
   * Applies saved selection state to a checkbox
   */
  function applySelectionState(checkbox, groupName) {
    const selections = loadCheckboxSelections();
    if (selections[groupName] === true) {
      checkbox.checked = true;
      console.log('✅ Restored selection for:', groupName);
    }
  }

  /**
   * Adds the "Quick Share" button under the purple button group
   */
  function addQuickShareButton(selectAllContainer) {
      if (document.querySelector('#share-unlimited-quick-share-btn')) return;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.id = 'share-unlimited-quick-share-btn';
      
      buttonContainer.style.cssText = `
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1877f2;
          border: none;
          z-index: 10;
          position: relative;
          overflow: hidden;
          opacity: 0;
          max-height: 0;
          transition: all 0.3s ease;
          pointer-events: none;
      `;
      
      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.style.cssText = `
          display: flex;
          gap: 12px;
          width: 100%;
          align-items: center;
      `;
      
      const button = document.createElement('button');
      button.id = 'share-unlimited-share-btn';
      button.style.cssText = `
          background: transparent;
          color: white;
          padding: 10px 24px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          pointer-events: auto;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          flex: 1;
          justify-content: center;
      `;
      button.innerHTML = 'Share to Selected Groups';
      
      button.addEventListener('mouseenter', () => {
          button.style.background = 'rgba(255, 255, 255, 0.2)';
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      });
      
      button.addEventListener('mouseleave', () => {
          button.style.background = 'transparent';
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = 'none';
      });
      
      button.addEventListener('click', async () => {
          if (window.ShareUnlimited.Core && window.ShareUnlimited.Core.handleQuickShare) {
            await window.ShareUnlimited.Core.handleQuickShare();
          }
      });
      
      const resetButton = document.createElement('button');
      resetButton.id = 'share-unlimited-reset-btn';
      resetButton.style.cssText = `
          background: rgba(255, 59, 48, 0.2);
          color: white;
          padding: 10px 20px;
          border: 2px solid rgba(255, 59, 48, 0.5);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: auto;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      `;
      resetButton.innerHTML = '🔄 Reset';
      
      resetButton.addEventListener('mouseenter', () => {
          resetButton.style.background = 'rgba(255, 59, 48, 0.4)';
          resetButton.style.transform = 'translateY(-2px)';
          resetButton.style.boxShadow = '0 4px 12px rgba(255, 59, 48, 0.3)';
      });
      
      resetButton.addEventListener('mouseleave', () => {
          resetButton.style.background = 'rgba(255, 59, 48, 0.2)';
          resetButton.style.transform = 'translateY(0)';
          resetButton.style.boxShadow = 'none';
      });
      
      resetButton.addEventListener('click', () => {
          // Uncheck all checkboxes
          const allCheckboxes = document.querySelectorAll('.multi-share-checkbox');
          allCheckboxes.forEach(cb => {
              if (cb.checked) {
                  cb.checked = false;
              }
          });
          
          // Also uncheck the "Select All" checkbox if it exists
          const selectAllCheckbox = document.getElementById('share-unlimited-select-all');
          if (selectAllCheckbox) {
              selectAllCheckbox.checked = false;
          }
          
          // Clear saved selections
          clearCheckboxSelections();
          
          // Update button visibility (should hide the quick share button)
          updateQuickShareButtonVisibility();
          
          console.log('✅ All selections cleared');
      });
      
      buttonsWrapper.appendChild(button);
      buttonsWrapper.appendChild(resetButton);
      buttonContainer.appendChild(buttonsWrapper);
      
      // Insert right after the select all container
      if (selectAllContainer && selectAllContainer.parentElement) {
          selectAllContainer.parentElement.insertBefore(buttonContainer, selectAllContainer.nextSibling);
      }
      
      updateQuickShareButtonVisibility();
  }

  /**
   * Updates the Quick Share button visibility based on selected checkboxes
   */
  function updateQuickShareButtonVisibility() {
      const buttonContainer = document.querySelector('#share-unlimited-quick-share-btn');
      if (!buttonContainer) return;
      
      const checkedCount = document.querySelectorAll('.multi-share-checkbox:checked').length;
      // console.log(`Checking button visibility: ${checkedCount} groups selected`);
      
      if (checkedCount > 0) {
          buttonContainer.style.opacity = '1';
          buttonContainer.style.maxHeight = '100px';
          buttonContainer.style.padding = '12px 16px';
          buttonContainer.style.pointerEvents = 'auto';
          
          const button = buttonContainer.querySelector('button');
          if (button) {
              button.innerHTML = `Share to ${checkedCount} Selected Group${checkedCount > 1 ? 's' : ''}`;
              
              if (!button.classList.contains('su-pulse-animation')) {
                  button.classList.add('su-pulse-animation');
                  
                  if (!document.getElementById('su-pulse-style')) {
                      const style = document.createElement('style');
                      style.id = 'su-pulse-style';
                      style.textContent = `
                          @keyframes suPulse {
                              0% { box-shadow: 0 0 0 0 rgba(24, 119, 242, 0.7); }
                              70% { box-shadow: 0 0 0 15px rgba(24, 119, 242, 0); }
                              100% { box-shadow: 0 0 0 0 rgba(24, 119, 242, 0); }
                          }
                          .su-pulse-animation {
                              animation: suPulse 2s infinite;
                          }
                      `;
                      document.head.appendChild(style);
                  }
              }
          }
      } else {
          buttonContainer.style.opacity = '0';
          buttonContainer.style.maxHeight = '0';
          buttonContainer.style.padding = '0';
          buttonContainer.style.pointerEvents = 'none';
      }
  }

  /**
   * Injects a "Select All" checkbox into the dialog header or list top
   */
  function addSelectAllCheckbox(dialog) {
      if (dialog.querySelector('#share-unlimited-select-all-container')) return;
      
      // Check if user has expired license - if so, show expired button instead
      chrome.storage.local.get(['authExpiry'], (result) => {
        const { authExpiry } = result;
        const isExpired = !authExpiry || new Date(authExpiry) <= new Date();
        const isNewUser = !authExpiry; // No expiry date means never started (new user)
        
        if (isExpired) {
          // User is expired - find insertion point and add expired CTA
          const insertLocation = findInsertionLocation(dialog);
          if (insertLocation && window.ExpiredOverlay) {
            window.ExpiredOverlay.createFacebookExpiredButton(insertLocation);
          }
          
          // If it's a NEW user (never started trial), stop here (keep blocking behavior)
          if (isNewUser) {
            return;
          }
          
          // If it's an EXPIRED user (has authExpiry but past), continue to add normal UI
          // This allows them to use the extension with the banner + watermark
        }
        
        // User is authorized OR is an expired user (not new) - proceed with normal button setup
        continueAddingSelectAllCheckbox(dialog);
      });
  }
  
  /**
   * Helper to find insertion location for buttons
   */
  function findInsertionLocation(dialog) {
      const h2Elements = dialog.querySelectorAll('h2');
      let hasShareToGroupTitle = false;
      
      for (const h2 of h2Elements) {
          const h2Text = h2.textContent.trim();
          const spanInH2 = h2.querySelector('span');
          const spanText = spanInH2 ? spanInH2.textContent.trim() : '';
          
          if (h2Text === 'Share to a group' || spanText === 'Share to a group') {
              hasShareToGroupTitle = true;
              break;
          }
      }
      
      if (!hasShareToGroupTitle) return null;

      let insertLocation = null;
      
      const searchInput = dialog.querySelector('input[aria-label*="Search"], input[placeholder*="Search"]');
      if (searchInput) {
          let parent = searchInput.parentElement;
          while(parent && parent.parentElement !== dialog && !parent.classList.contains('scrollable')) {
              parent = parent.parentElement;
          }
          if (parent) {
              insertLocation = parent;
          }
      }

      if (!insertLocation) {
          const titleElement = dialog.querySelector('h2');
          if (titleElement) {
              let parent = titleElement.parentElement;
              while (parent && parent !== dialog) {
                  const nextSibling = parent.nextElementSibling;
                  if (nextSibling) {
                      insertLocation = nextSibling;
                      break;
                  }
                  parent = parent.parentElement;
              }
          }
      }

      if (!insertLocation) {
          const firstGroupButton = dialog.querySelector('div[role="button"]');
          if (firstGroupButton) {
              let parent = firstGroupButton.parentElement;
              while (parent && parent !== dialog) {
                  const style = window.getComputedStyle(parent);
                  if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                      insertLocation = parent.firstElementChild || parent;
                      break;
                  }
                  parent = parent.parentElement;
              }
              
              if (!insertLocation) {
                  insertLocation = firstGroupButton.parentElement;
              }
          }
      }

      if (!insertLocation) {
          const hrElement = dialog.querySelector('hr');
          if (hrElement) {
              insertLocation = hrElement.nextElementSibling || hrElement.parentElement;
          }
      }
      
      return insertLocation;
  }
  
  /**
   * Continues adding Select All checkbox for authorized users
   */
  function continueAddingSelectAllCheckbox(dialog) {
      const h2Elements = dialog.querySelectorAll('h2');
      let hasShareToGroupTitle = false;
      
      for (const h2 of h2Elements) {
          const h2Text = h2.textContent.trim();
          const spanInH2 = h2.querySelector('span');
          const spanText = spanInH2 ? spanInH2.textContent.trim() : '';
          
          if (h2Text === 'Share to a group' || spanText === 'Share to a group') {
              hasShareToGroupTitle = true;
              break;
          }
      }
      
      if (!hasShareToGroupTitle) return;

      let insertLocation = null;
      
      const searchInput = dialog.querySelector('input[aria-label*="Search"], input[placeholder*="Search"]');
      if (searchInput) {
          let parent = searchInput.parentElement;
          while(parent && parent.parentElement !== dialog && !parent.classList.contains('scrollable')) {
              parent = parent.parentElement;
          }
          if (parent) {
              insertLocation = parent;
          }
      }

      if (!insertLocation) {
          const titleElement = dialog.querySelector('h2');
          if (titleElement) {
              let parent = titleElement.parentElement;
              while (parent && parent !== dialog) {
                  const nextSibling = parent.nextElementSibling;
                  if (nextSibling) {
                      insertLocation = nextSibling;
                      break;
                  }
                  parent = parent.parentElement;
              }
          }
      }

      if (!insertLocation) {
          const firstGroupButton = dialog.querySelector('div[role="button"]');
          if (firstGroupButton) {
              let parent = firstGroupButton.parentElement;
              while (parent && parent !== dialog) {
                  const style = window.getComputedStyle(parent);
                  if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                      insertLocation = parent.firstElementChild || parent;
                      break;
                  }
                  parent = parent.parentElement;
              }
              
              if (!insertLocation) {
                  insertLocation = firstGroupButton.parentElement;
              }
          }
      }

      if (!insertLocation) {
          const hrElement = dialog.querySelector('hr');
          if (hrElement) {
              insertLocation = hrElement.nextElementSibling || hrElement.parentElement;
          }
      }

      if (insertLocation) {
          const container = document.createElement('div');
          container.id = 'share-unlimited-select-all-container';
          container.style.cssText = `
              padding: 12px 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #242526;
              border: none;
              border-radius: 8px 8px 0 0;
              z-index: 10;
              position: relative;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          `;
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = 'share-unlimited-select-all';
          checkbox.style.cssText = `
              width: 44px;
              height: 44px;
              cursor: pointer;
              margin-right: 12px;
              accent-color: #2D88FF;
              position: relative;
              z-index: 1;
              transform: scale(1);
              transition: transform 0.2s ease;
              border: 2px solid #3A3B3C;
              border-radius: 6px;
          `;
          
          checkbox.addEventListener('mouseenter', () => { checkbox.style.transform = 'scale(1.05)'; });
          checkbox.addEventListener('mouseleave', () => { checkbox.style.transform = 'scale(1)'; });
          
          const label = document.createElement('label');
          label.htmlFor = 'share-unlimited-select-all';
          label.innerHTML = '<strong>Select All</strong>';
          label.style.cssText = `
              font-weight: 600;
              cursor: pointer;
              font-size: 16px;
              color: #E4E6EB;
              position: relative;
              z-index: 1;
              letter-spacing: 0.3px;
          `;
          
          checkbox.addEventListener('change', (e) => {
              const isChecked = e.target.checked;
              const allCheckboxes = dialog.querySelectorAll('.multi-share-checkbox');
              allCheckboxes.forEach(cb => {
                  if (cb.checked !== isChecked) {
                      cb.click(); 
                      cb.checked = isChecked; 
                  }
              });
          });

          container.appendChild(checkbox);
          container.appendChild(label);
          
          const showAllButton = document.createElement('button');
          showAllButton.id = 'share-unlimited-show-all-btn';
          showAllButton.innerHTML = '📋 Load All <span id="group-count-badge">(Loading...)</span>';
          showAllButton.style.cssText = `
              background: #3A3B3C;
              border: none;
              color: #E4E6EB;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              margin-left: 16px;
              position: relative;
              z-index: 1;
              transition: all 0.2s ease;
          `;
          
          showAllButton.addEventListener('mouseenter', () => {
              showAllButton.style.background = '#4E4F50';
              showAllButton.style.transform = 'translateY(-1px)';
          });
          
          showAllButton.addEventListener('mouseleave', () => {
              showAllButton.style.background = '#3A3B3C';
              showAllButton.style.transform = 'translateY(0)';
          });
          
          showAllButton.addEventListener('click', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (!window.ShareUnlimited.Core || !window.ShareUnlimited.Core.scrollToLoadAllGroups) {
                console.error('Core functionality not ready');
                return;
              }

              const badge = showAllButton.querySelector('#group-count-badge');
              showAllButton.innerHTML = '⏳ Loading all groups...';
              showAllButton.disabled = true;
              showAllButton.style.opacity = '0.7';
              showAllButton.style.cursor = 'wait';
              
              // FIX: Move addedGroupNames Set OUTSIDE the callback to persist across all scroll iterations
              // This prevents the same group from being processed multiple times
              const addedGroupNames = new Set();
              
              await window.ShareUnlimited.Core.scrollToLoadAllGroups(() => {
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
                          const groupName = window.ShareUnlimited.Core.extractAndValidateGroupName(buttonText);
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
                              applySelectionState(checkbox, groupName);
                              
                              checkbox.addEventListener('click', (e) => { 
                                e.stopPropagation(); 
                                setTimeout(updateQuickShareButtonVisibility, 50);
                                // Save selections when checkbox state changes
                                setTimeout(saveCheckboxSelections, 100);
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
              
              // Count actual checkboxes that were added (this is the accurate count)
              const totalCheckboxes = dialog.querySelectorAll('.multi-share-checkbox').length;
              
              showAllButton.innerHTML = `✅ Loaded ${totalCheckboxes} Groups!`;
              showAllButton.style.background = 'rgba(76, 217, 100, 0.4)';
              showAllButton.style.border = '2px solid rgba(76, 217, 100, 0.6)';
              
              // Hide the button after 2 seconds
              setTimeout(() => {
                  showAllButton.style.opacity = '0';
                  showAllButton.style.transform = 'scale(0.8)';
                  showAllButton.style.transition = 'all 0.3s ease-out';
                  setTimeout(() => {
                      showAllButton.remove();
                  }, 300);
              }, 2000);
          });
          
          container.appendChild(showAllButton);
          
          // Check for 1 Click Presets and only add button if templates exist
          chrome.storage.local.get(['oneClickTemplates'], (result) => {
              const templates = result.oneClickTemplates || [];
              if (templates.length > 0) {
                  const oneClickPresetsButton = document.createElement('button');
                  oneClickPresetsButton.id = 'share-unlimited-one-click-btn';
                  oneClickPresetsButton.innerHTML = '⚡ 1 Click Presets';
                  oneClickPresetsButton.style.cssText = `
                      background: #3A3B3C;
                      border: none;
                      color: #E4E6EB;
                      padding: 8px 16px;
                      border-radius: 6px;
                      font-size: 14px;
                      font-weight: 600;
                      cursor: pointer;
                      margin-left: 16px;
                      position: relative;
                      z-index: 1;
                      transition: all 0.2s ease;
                  `;
                  
                  oneClickPresetsButton.addEventListener('mouseenter', () => {
                      oneClickPresetsButton.style.background = '#4E4F50';
                      oneClickPresetsButton.style.transform = 'translateY(-1px)';
                  });
                  
                  oneClickPresetsButton.addEventListener('mouseleave', () => {
                      oneClickPresetsButton.style.background = '#3A3B3C';
                      oneClickPresetsButton.style.transform = 'translateY(0)';
                  });
                  
                  oneClickPresetsButton.addEventListener('click', async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.showOneClickPresetsModal) {
                        window.ShareUnlimited.UI.showOneClickPresetsModal();
                      }
                  });
                  
                  container.appendChild(oneClickPresetsButton);
              }
          });
          
          // Check for Group Presets and only add button if presets exist
          chrome.storage.local.get(['groupPresets'], (result) => {
              const presets = result.groupPresets || [];
              if (presets.length > 0) {
                  const groupPresetsButton = document.createElement('button');
                  groupPresetsButton.id = 'share-unlimited-group-presets-btn';
                  groupPresetsButton.innerHTML = `📖 Group Presets <span style="background: #2D88FF; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 4px; color: #E4E6EB;">${presets.length}</span>`;
                  groupPresetsButton.style.cssText = `
                      background: #3A3B3C;
                      border: none;
                      color: #E4E6EB;
                      padding: 8px 16px;
                      border-radius: 6px;
                      font-size: 14px;
                      font-weight: 600;
                      cursor: pointer;
                      margin-left: 16px;
                      position: relative;
                      z-index: 1;
                      transition: all 0.2s ease;
                  `;
                  
                  groupPresetsButton.addEventListener('mouseenter', () => {
                      groupPresetsButton.style.background = '#4E4F50';
                      groupPresetsButton.style.transform = 'translateY(-1px)';
                  });
                  
                  groupPresetsButton.addEventListener('mouseleave', () => {
                      groupPresetsButton.style.background = '#3A3B3C';
                      groupPresetsButton.style.transform = 'translateY(0)';
                  });
                  
                  groupPresetsButton.addEventListener('click', async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.showGroupPresetsModal) {
                        window.ShareUnlimited.UI.showGroupPresetsModal();
                      }
                  });
                  
                  container.appendChild(groupPresetsButton);
              }
          });
          
          setTimeout(async () => {
              const badge = document.getElementById('group-count-badge');
              if (badge) {
                  // Count actual checkboxes instead of using getGroupNames()
                  const checkboxCount = dialog.querySelectorAll('.multi-share-checkbox').length;
                  badge.textContent = `(${checkboxCount})`;
              }
          }, 1000);
          
          if (insertLocation.parentElement) {
              insertLocation.parentElement.insertBefore(container, insertLocation);
              
              // Add the Quick Share button after the select all container
              addQuickShareButton(container);
          }
      }
  }

  /**
   * Injects checkboxes next to each group in the share dialog.
   */
  async function addCheckboxesToGroups() {
    const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
    if (!dialog) return;
    
    const h2Elements = dialog.querySelectorAll('h2');
    let isShareToGroupDialog = false;
    
    for (let i = 0; i < h2Elements.length; i++) {
      const h2 = h2Elements[i];
      const h2Text = h2.textContent.trim();
      const spanInH2 = h2.querySelector('span');
      const spanText = spanInH2 ? spanInH2.textContent.trim() : '';
      
      if (h2Text === 'Share to a group' || spanText === 'Share to a group') {
        isShareToGroupDialog = true;
        break;
      }
    }
    
    if (!isShareToGroupDialog) return;
    
    // Find the "All groups" heading to identify where group list starts
    let allGroupsElement = null;
    const allH2Elements = dialog.querySelectorAll('h2');
    for (const h2 of allH2Elements) {
      const h2Text = h2.textContent.trim();
      const spanInH2 = h2.querySelector('span');
      const spanText = spanInH2 ? spanInH2.textContent.trim() : '';
      
      if (h2Text === 'All groups' || spanText === 'All groups') {
        allGroupsElement = h2;
        console.log('Found "All groups" heading - will only add checkboxes after this');
        break;
      }
    }
    
    let checkboxesAdded = 0;
    let attempts = 0;
    const maxAttempts = 10;
    
    const scanAndAddCheckboxes = () => {
      let newCheckboxes = 0;
      const allButtons = dialog.querySelectorAll('div[role="button"]');
      const addedGroupNames = new Set();
      
      allButtons.forEach((button, index) => {
        // Skip if this button appears before "All groups" heading
        if (allGroupsElement) {
          const buttonPosition = button.compareDocumentPosition(allGroupsElement);
          // If button comes before allGroupsElement in document order, skip it
          if (buttonPosition & Node.DOCUMENT_POSITION_FOLLOWING) {
            return; // Skip buttons that appear before "All groups"
          }
        }
        
        const buttonText = button.textContent.trim();
        const buttonTextLength = buttonText.length;
        const hasImage = button.querySelector('image, img, svg') !== null;
        
        const hasGroupIndicator = buttonText.includes('Public group') || 
                                 buttonText.includes('Private group') ||
                                 buttonText.toLowerCase().includes('members');
        
        if (buttonTextLength > 10 && buttonTextLength < 200 && hasImage && hasGroupIndicator) {
          if (button.querySelector('.multi-share-checkbox')) return;
          
          // Use the same validation as getGroupNames()
          if (!window.ShareUnlimited.Core || !window.ShareUnlimited.Core.extractAndValidateGroupName) return;
          const groupName = window.ShareUnlimited.Core.extractAndValidateGroupName(buttonText);
          if (!groupName || addedGroupNames.has(groupName)) return;
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
          applySelectionState(checkbox, groupName);
          
          checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            setTimeout(updateQuickShareButtonVisibility, 50);
            // Save selections when checkbox state changes
            setTimeout(saveCheckboxSelections, 100);
          }, true);
          
          checkbox.addEventListener('mousedown', (e) => { e.stopPropagation(); }, true);
          
          button.style.display = 'flex';
          button.style.alignItems = 'center';
          button.style.gap = '8px';
          button.prepend(checkbox);
          newCheckboxes++;
        }
      });
      return newCheckboxes;
    };
  
    while (attempts < maxAttempts && checkboxesAdded === 0) {
      attempts++;
      await new Promise(r => setTimeout(r, 500));
      checkboxesAdded = scanAndAddCheckboxes();
      
      if (checkboxesAdded > 0) {
        addSelectAllCheckbox(dialog);
        // Note: Checkbox scanning is now handled by content_main.js event-based detection
        // with 1.5-second intervals when "Share to a group" heading is present
        break;
      }
    }
  }

  /**
   * Adds "Multi-Group" buttons next to native Facebook share buttons
   */
  function addMultiGroupButtons() {
    // Find all potential share buttons that don't already have a Multi-Group button
    const allButtons = document.querySelectorAll('div[role="button"]');
    
    allButtons.forEach(button => {
      // Skip if we already added a button here
      if (button.dataset.multiGroupAdded === 'true') return;
      
      // Skip if this IS a Multi-Group button (to avoid infinite loops)
      if (button.dataset.multiGroupButton === 'true') return;
      
      // Check if this is a Share button
      const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
      const buttonText = button.textContent.trim();
      
      const isShareButton = (
        ariaLabel.includes('send this to friends') ||
        (ariaLabel.includes('share') && !ariaLabel.includes('boost') && !ariaLabel.includes('promote')) ||
        (buttonText === 'Share' && button.querySelector('i[data-visualcompletion="css-img"]'))
      );
      
      if (!isShareButton) return;
      
      // Skip if in a dialog (only add to post buttons, not dialog buttons)
      if (button.closest('div[role="dialog"]')) return;
      
      // Mark this button as processed FIRST to prevent re-processing
      button.dataset.multiGroupAdded = 'true';
      
      // Get the parent container
      const parentContainer = button.closest('.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x14vy60q.xyiysdx.x10b6aqq.x1yrsyyn');
      
      if (!parentContainer) {
        return;
      }
      
      // Clone the share button structure
      const multiGroupButton = button.cloneNode(true);
      
      // Update the text to "Multi-Group"
      const textSpan = multiGroupButton.querySelector('span[dir="auto"]');
      if (textSpan) {
        textSpan.textContent = 'Multi-Group';
      }
      
      // Update aria-label
      multiGroupButton.setAttribute('aria-label', 'Share this to multiple groups at once');
      
      // Remove the intercepted flag if it exists
      delete multiGroupButton.dataset.intercepted;
      delete multiGroupButton.dataset.multiGroupAdded;
      
      // Add a special marker to identify this as our Multi-Group button AND prevent processing
      multiGroupButton.dataset.multiGroupButton = 'true';
      
      // Add click handler
      multiGroupButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🎯 Multi-Group button clicked!');
        
        // First, click the original Share button to track it
        console.log('📍 Step 1: Clicking original Share button...');
        button.click();
        
        // Wait for share menu to appear
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Then automatically click the "Group" option using enhanced selectors
        console.log('📍 Step 2: Looking for Group option in share menu...');
        const menuItems = document.querySelectorAll('div[role="button"], div[role="menuitem"]');
        
        for (const item of menuItems) {
          const text = item.textContent.trim();
          const itemAriaLabel = item.getAttribute('aria-label') || '';
          
          // Enhanced matching: Check for "Group" text in spans AND check for group icon
          const hasGroupText = text.includes('Group') && !text.includes('Public group') && !text.includes('Private group');
          const hasGroupIcon = item.querySelector('i[style*="zLpE14dDq86.png"]') !== null || 
                               item.querySelector('div[style*="zLpE14dDq86.png"]') !== null;
          const hasGroupInSpan = Array.from(item.querySelectorAll('span')).some(span => 
            span.textContent.trim() === 'Group'
          );
          
          if ((hasGroupText || hasGroupInSpan) && (hasGroupIcon || text === 'Group')) {
            console.log('✅ Found Group option:', text, '| aria-label:', itemAriaLabel);
            
            // Click with multiple methods for reliability
            item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            item.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            item.click();
            
            break;
          }
        }
      }, true);
      
      // Create a wrapper to hold the Multi-Group button (same structure as Share button)
      const wrapper = document.createElement('div');
      wrapper.className = parentContainer.className;
      wrapper.dataset.multiGroupWrapper = 'true'; // Mark wrapper to prevent processing
      wrapper.appendChild(multiGroupButton);
      
      // Insert the Multi-Group button right after the Share button's parent
      parentContainer.parentElement.insertBefore(wrapper, parentContainer.nextSibling);
    });
  }

  /**
   * Shows a success notification at the top right
   */
  function showSuccessNotification(message) {
    const existing = document.getElementById('share-unlimited-success-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'share-unlimited-success-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        z-index: 999999999;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Applies a Group Preset directly on Facebook by loading all groups and checking the preset groups
   */
  async function applyGroupPresetOnFacebook(presetId) {
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['groupPresets'], resolve);
    });
    
    const presets = result.groupPresets || [];
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
      alert('Preset not found!');
      return;
    }
    
    // Show loading message
    console.log(`Applying preset "${preset.name}" with ${preset.groups.length} groups...`);
    
    // First, ensure all groups are loaded
    const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
    if (!dialog) {
      alert('Please make sure the share dialog is open!');
      return;
    }
    
    // Show loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'preset-loading-msg';
    loadingMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      z-index: 999999999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;
    loadingMsg.innerHTML = `⏳ Applying preset "${preset.name}"...<br><small style="font-size: 12px; opacity: 0.9;">Loading all groups...</small>`;
    document.body.appendChild(loadingMsg);
    
    // STEP 1: Load all groups and add checkboxes (without selecting)
    loadingMsg.innerHTML = `⏳ Loading all groups...<br><small style="font-size: 12px; opacity: 0.9;">Step 1: Loading groups...</small>`;
    
    if (window.ShareUnlimited.Core && window.ShareUnlimited.Core.scrollToLoadAllGroups) {
      // FIX: Move addedGroupNames Set OUTSIDE the callback to persist across all scroll iterations
      const addedGroupNames = new Set();
      
      await window.ShareUnlimited.Core.scrollToLoadAllGroups(() => {
        // Add checkboxes to newly loaded groups
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
            const groupName = window.ShareUnlimited.Core.extractAndValidateGroupName(buttonText);
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
              
              checkbox.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                setTimeout(updateQuickShareButtonVisibility, 50);
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
    }
    
    // STEP 2: Wait 4 seconds for all checkboxes to fully render and settle
    loadingMsg.innerHTML = `⏳ Preparing to apply preset...<br><small style="font-size: 12px; opacity: 0.9;">Step 2: Waiting for checkboxes to settle...</small>`;
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // STEP 3: Now select the groups from the preset (single pass)
    loadingMsg.innerHTML = `⏳ Applying preset...<br><small style="font-size: 12px; opacity: 0.9;">Step 3: Selecting groups...</small>`;
    
    // First, uncheck all checkboxes
    const allCheckboxes = dialog.querySelectorAll('.multi-share-checkbox');
    allCheckboxes.forEach(cb => cb.checked = false);
    
    // Build a map of group names to checkboxes for O(1) lookup
    const groupCheckboxMap = new Map();
    allCheckboxes.forEach(checkbox => {
      const button = checkbox.closest('div[role="button"]');
      if (button) {
        const buttonText = button.textContent.trim();
        const groupName = window.ShareUnlimited.Core.extractAndValidateGroupName(buttonText);
        if (groupName && !groupCheckboxMap.has(groupName)) {
          groupCheckboxMap.set(groupName, checkbox);
        }
      }
    });
    
    // Now check only the groups in the preset
    let matchedCount = 0;
    preset.groups.forEach(groupName => {
      const checkbox = groupCheckboxMap.get(groupName);
      if (checkbox && !checkbox.checked) {
        checkbox.checked = true;
        matchedCount++;
      }
    });
    
    // Update loading message with results
    loadingMsg.innerHTML = `✓ Applied "${preset.name}"<br><small style="font-size: 12px; opacity: 0.9;">Selected ${matchedCount} of ${preset.groups.length} groups</small>`;
    loadingMsg.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    
    // Show Quick Share button if available
    updateQuickShareButtonVisibility();
    
    // Remove loading message after 3 seconds
    setTimeout(() => {
      loadingMsg.remove();
      
      // Clean up any lingering modal overlays
      const presetModal = document.getElementById('share-unlimited-group-presets-modal');
      if (presetModal) presetModal.remove();
      
      const mergedModal = document.getElementById('share-unlimited-merged-presets-modal');
      if (mergedModal) mergedModal.remove();
    }, 3000);
    
    // Removed warning alert - not all groups being found is normal behavior
    // when users aren't members of all groups in the preset
  }

  // Export functions
  Object.assign(UI, {
    addQuickShareButton,
    updateQuickShareButtonVisibility,
    addSelectAllCheckbox,
    addCheckboxesToGroups,
    addMultiGroupButtons,
    showSuccessNotification,
    applyGroupPresetOnFacebook
  });

})();
