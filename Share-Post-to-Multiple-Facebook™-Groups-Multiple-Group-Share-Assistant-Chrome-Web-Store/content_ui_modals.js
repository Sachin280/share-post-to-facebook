// content_ui_modals.js - Modal dialogs and popups
(function() {
  'use strict';

  // Initialize Namespace
  window.ShareUnlimited = window.ShareUnlimited || {};
  window.ShareUnlimited.UI = window.ShareUnlimited.UI || {};
  
  const UI = window.ShareUnlimited.UI;

  /**
   * Shows the license expired modal
   */
  function showLicenseExpiredModal() {
    const existing = document.getElementById('share-unlimited-license-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'share-unlimited-license-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 99999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
        border-radius: 16px;
        padding: 40px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
        <h2 style="color: white; margin: 0 0 16px 0; font-size: 28px; font-weight: 700;">Glad you tried MGSA!</h2>
        <p style="color: rgba(255, 255, 255, 0.95); margin: 0 0 12px 0; font-size: 18px; line-height: 1.6; font-weight: 500;">
            Want to continue sharing in 1 click?
        </p>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 0 0 28px 0; font-size: 16px; line-height: 1.5;">
            Click on the extension icon to extend your license today! ✨
        </p>
        <button id="close-license-modal" style="
            background: rgba(255, 255, 255, 0.25);
            border: 2px solid white;
            color: white;
            padding: 14px 36px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        ">Got it!</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('#close-license-modal');
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
  }

  /**
   * Shows the post content input modal
   */
  function showPostContentModal(selectedGroups) {
    const existing = document.getElementById('share-unlimited-post-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'share-unlimited-post-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 99999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 0;
        max-width: 520px;
        width: 90%;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
    `;
    
    // Build the modal content step by step to conditionally add elements
    let modalHTML = `
        <!-- Header -->
        <div style="padding: 16px 20px; border-bottom: 1px solid #e4e6eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="color: #050505; margin: 0; font-size: 20px; font-weight: 700;">
                    Share to Multiple Groups
                </h2>
                <button id="close-post-modal" style="
                    background: #f0f2f5;
                    border: none;
                    color: #65676b;
                    font-size: 20px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">✕</button>
            </div>
        </div>
        
        <!-- Main content area -->
        <div style="padding: 16px 20px;">
        
            <!-- Save Group List Preset CTA -->
            <div id="save-preset-cta" style="
                background: #e7f3ff;
                border: 1px solid #1877f2;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
                cursor: pointer;
                transition: all 0.2s;
            ">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">💾</span>
                    <div style="flex: 1;">
                        <div style="color: #1c1e21; font-size: 13px; font-weight: 600; margin-bottom: 2px;">
                            Save this group list?
                        </div>
                        <div style="color: #65676b; font-size: 12px;">
                            Sharing to ${selectedGroups.length} groups
                        </div>
                    </div>
                </div>
                <button id="save-group-list-preset" style="
                    width: 100%;
                    background: #1877f2;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Save as Preset</button>
            </div>
        
            <div style="
                background: #f0f2f5;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
            ">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 16px;">📋</span>
                    <p style="color: #050505; margin: 0; font-size: 14px; font-weight: 600;">
                        ${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected
                    </p>
                </div>
                <div style="max-height: 80px; overflow-y: auto;">
                    ${selectedGroups.map((g, idx) => `
                        <div style="color: #65676b; font-size: 12px; padding: 4px 0;">
                            ${idx + 1}. ${g}
                        </div>
                    `).join('')}
                </div>
            </div>
        
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label style="color: #050505; font-size: 14px; font-weight: 600;">
                        Post Content (Optional)
                    </label>
                    <div id="apply-template-container"></div>
                </div>
                <textarea id="quick-share-post-content" placeholder="What's on your mind?" style="
                    width: 100%;
                    height: 80px;
                    padding: 12px;
                    border: 1px solid #ccd0d5;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: inherit;
                    resize: vertical;
                    box-sizing: border-box;
                    transition: border-color 0.2s;
                    background: white;
                    color: #050505;
                " onfocus="this.style.borderColor='#1877f2'" onblur="this.style.borderColor='#ccd0d5'"></textarea>
            </div>
            
            <div id="save-template-container" style="margin-bottom: 12px;"></div>
            
            <div style="display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid #e4e6eb;">
                <button id="cancel-quick-share" style="
                    flex: 1;
                    background: #e4e6eb;
                    border: none;
                    color: #050505;
                    padding: 10px 16px;
                    border-radius: 6px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Cancel</button>
                
                <button id="confirm-quick-share" style="
                    flex: 2;
                    background: #1877f2;
                    border: none;
                    color: white;
                    padding: 10px 16px;
                    border-radius: 6px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Share Now</button>
            </div>
        </div>
    `;
    
    modalContent.innerHTML = modalHTML;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const textarea = modal.querySelector('#quick-share-post-content');
    const closeBtn = modal.querySelector('#close-post-modal');
    const cancelBtn = modal.querySelector('#cancel-quick-share');
    const confirmBtn = modal.querySelector('#confirm-quick-share');
    const savePresetCTA = modal.querySelector('#save-preset-cta');
    const savePresetBtn = modal.querySelector('#save-group-list-preset');
    
    // Add hover effects to Save Preset CTA
    if (savePresetCTA) {
      savePresetCTA.addEventListener('mouseenter', () => {
        savePresetCTA.style.transform = 'translateY(-2px)';
        savePresetCTA.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
      });
      savePresetCTA.addEventListener('mouseleave', () => {
        savePresetCTA.style.transform = 'translateY(0)';
        savePresetCTA.style.boxShadow = 'none';
      });
    }
    
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = '#d8dadf'; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = '#f0f2f5'; });
    closeBtn.addEventListener('click', () => modal.remove());
    
    cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = '#d8dadf'; });
    cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = '#e4e6eb'; });
    cancelBtn.addEventListener('click', () => modal.remove());
    
    confirmBtn.addEventListener('mouseenter', () => { confirmBtn.style.background = '#166fe5'; });
    confirmBtn.addEventListener('mouseleave', () => { confirmBtn.style.background = '#1877f2'; });
    confirmBtn.addEventListener('click', async () => {
        const postContent = textarea.value.trim();
        // Allow empty post content - user can share without text
        
        modal.remove();
        if (window.ShareUnlimited.Core && window.ShareUnlimited.Core.shareToSelectedGroups) {
          await window.ShareUnlimited.Core.shareToSelectedGroups(selectedGroups, postContent, null, null, 10, false);
        }
    });
    
    // Save Group List Preset button
    if (savePresetBtn) {
      savePresetBtn.addEventListener('mouseenter', () => { savePresetBtn.style.background = '#166fe5'; });
      savePresetBtn.addEventListener('mouseleave', () => { savePresetBtn.style.background = '#1877f2'; });
      savePresetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showSaveGroupListPresetDialog(selectedGroups);
      });
    }
    
    // Check if user has post templates to conditionally show Apply Template button
    chrome.storage.local.get(['postTemplates'], (result) => {
        const postTemplates = result.postTemplates || {};
        const hasTemplates = Object.keys(postTemplates).length > 0;
        
        const applyTemplateContainer = modal.querySelector('#apply-template-container');
        if (hasTemplates && applyTemplateContainer) {
            const applyTemplateBtn = document.createElement('button');
            applyTemplateBtn.id = 'apply-post-template-btn';
            applyTemplateBtn.innerHTML = '📖 Apply Template';
            applyTemplateBtn.style.cssText = `
                background: #e4e6eb;
                border: none;
                color: #050505;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            `;
            applyTemplateBtn.addEventListener('mouseenter', () => { applyTemplateBtn.style.background = '#d8dadf'; });
            applyTemplateBtn.addEventListener('mouseleave', () => { applyTemplateBtn.style.background = '#e4e6eb'; });
            applyTemplateBtn.addEventListener('click', () => {
                showApplyPostTemplateDialog(textarea);
            });
            applyTemplateContainer.appendChild(applyTemplateBtn);
        }
    });
    
    // Monitor textarea for text to conditionally show Save Template button
    const saveTemplateContainer = modal.querySelector('#save-template-container');
    let savePostTemplateBtn = null;
    
    const updateSaveTemplateButton = () => {
        const hasText = textarea.value.trim().length > 0;
        
        if (hasText && !savePostTemplateBtn) {
            // Create the button
            savePostTemplateBtn = document.createElement('button');
            savePostTemplateBtn.id = 'save-post-template';
            savePostTemplateBtn.innerHTML = '📝 Save as Post Template';
            savePostTemplateBtn.style.cssText = `
                width: 100%;
                background: #1877f2;
                border: none;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                opacity: 0;
                transform: translateY(-10px);
            `;
            savePostTemplateBtn.addEventListener('mouseenter', () => { savePostTemplateBtn.style.background = '#166fe5'; });
            savePostTemplateBtn.addEventListener('mouseleave', () => { savePostTemplateBtn.style.background = '#1877f2'; });
            savePostTemplateBtn.addEventListener('click', () => {
                const postContent = textarea.value.trim();
                if (!postContent) {
                    alert('Please enter some post content before saving as a template!');
                    return;
                }
                showSavePostTemplateDialog(postContent);
            });
            saveTemplateContainer.appendChild(savePostTemplateBtn);
            
            // Animate in
            setTimeout(() => {
                savePostTemplateBtn.style.opacity = '1';
                savePostTemplateBtn.style.transform = 'translateY(0)';
            }, 10);
        } else if (!hasText && savePostTemplateBtn) {
            // Remove the button
            savePostTemplateBtn.style.opacity = '0';
            savePostTemplateBtn.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (savePostTemplateBtn && savePostTemplateBtn.parentNode) {
                    savePostTemplateBtn.remove();
                }
                savePostTemplateBtn = null;
            }, 200);
        }
    };
    
    // Monitor textarea changes
    textarea.addEventListener('input', updateSaveTemplateButton);
    textarea.addEventListener('keyup', updateSaveTemplateButton);
    textarea.addEventListener('paste', () => setTimeout(updateSaveTemplateButton, 10));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Initial check for save template button visibility
    updateSaveTemplateButton();
    
    textarea.focus();
  }

  /**
   * Shows Group Presets modal directly on Facebook for selecting and applying presets
   */
  async function showGroupPresetsModal() {
    const existing = document.getElementById('share-unlimited-group-presets-modal');
    if (existing) existing.remove();
    
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['groupPresets'], resolve);
    });
    
    const presets = result.groupPresets || [];
    
    const modal = document.createElement('div');
    modal.id = 'share-unlimited-group-presets-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 99999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
      border-radius: 16px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '📖 Group Presets';
    title.style.cssText = `
      color: white;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 24px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.3)'; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.2)'; });
    closeBtn.addEventListener('click', () => modal.remove());
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    modalContent.appendChild(header);
    
    if (presets.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.style.cssText = `
        text-align: center;
        padding: 40px 20px;
        color: white;
      `;
      emptyState.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
        <p style="font-size: 18px; margin-bottom: 8px;">No Group Presets Yet</p>
        <p style="opacity: 0.8;">Create presets from the extension popup to use them here!</p>
      `;
      modalContent.appendChild(emptyState);
    } else {
      // Container for preset cards
      const presetsContainer = document.createElement('div');
      presetsContainer.id = 'presets-container';
      
      presets.forEach(preset => {
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.style.cssText = `
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.2s;
          cursor: pointer;
        `;
        card.addEventListener('mouseenter', () => {
          card.style.background = 'rgba(255, 255, 255, 0.2)';
          card.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.background = 'rgba(255, 255, 255, 0.15)';
          card.style.transform = 'translateY(0)';
        });
        
        const createdDate = new Date(preset.createdAt).toLocaleDateString();
        
        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <input type="checkbox" class="preset-checkbox" data-preset-id="${preset.id}" style="
              width: 24px;
              height: 24px;
              cursor: pointer;
              accent-color: #1877f2;
              flex-shrink: 0;
            ">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <span style="font-size: 24px;">📖</span>
              <span style="color: white; font-size: 18px; font-weight: 600;">${preset.name}</span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-left: 36px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>🎯</span>
              <span>${preset.groups.length} group${preset.groups.length > 1 ? 's' : ''}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>📅</span>
              <span>Created: ${createdDate}</span>
            </div>
            <div style="margin-top: 8px; max-height: 100px; overflow-y: auto;">
              ${preset.groups.map(g => `<div style="background: rgba(255, 255, 255, 0.2); display: inline-block; padding: 4px 8px; border-radius: 4px; margin: 2px; font-size: 12px;">${g}</div>`).join('')}
            </div>
          </div>
        `;
        
        presetsContainer.appendChild(card);
        
        // Get the checkbox after it's added to DOM
        const checkbox = card.querySelector('.preset-checkbox');
        
        // Make the card clickable to toggle checkbox, but not the checkbox itself
        card.addEventListener('click', (e) => {
          // Only toggle if we didn't click directly on the checkbox
          if (e.target !== checkbox) {
            e.preventDefault();
            e.stopPropagation();
            checkbox.checked = !checkbox.checked;
            // Manually trigger the change event
            const event = new Event('change', { bubbles: true });
            checkbox.dispatchEvent(event);
          }
        });
        
        // Prevent checkbox clicks from bubbling to card
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      });
      
      modalContent.appendChild(presetsContainer);
      
      // Multi-select button (initially hidden)
      const multiSelectBtn = document.createElement('button');
      multiSelectBtn.id = 'multi-preset-share-btn';
      multiSelectBtn.style.cssText = `
        width: 100%;
        background: linear-gradient(135deg, #1877f2 0%, #0e5dc7 100%);
        border: none;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 16px;
        display: none;
        box-shadow: 0 4px 15px rgba(24, 119, 242, 0.4);
      `;
      multiSelectBtn.innerHTML = '🚀 Send to Unique Groups in Selected Presets';
      
      multiSelectBtn.addEventListener('mouseenter', () => {
        multiSelectBtn.style.transform = 'translateY(-2px)';
        multiSelectBtn.style.boxShadow = '0 6px 20px rgba(24, 119, 242, 0.6)';
      });
      multiSelectBtn.addEventListener('mouseleave', () => {
        multiSelectBtn.style.transform = 'translateY(0)';
        multiSelectBtn.style.boxShadow = '0 4px 15px rgba(24, 119, 242, 0.4)';
      });
      
      multiSelectBtn.addEventListener('click', () => {
        const selectedCheckboxes = modal.querySelectorAll('.preset-checkbox:checked');
        const selectedPresetIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-preset-id'));
        
        if (selectedPresetIds.length === 0) return;
        
        modal.remove();
        showMergedPresetsConfirmation(selectedPresetIds, presets);
      });
      
      modalContent.appendChild(multiSelectBtn);
    }
    
    modal.appendChild(modalContent);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
    
    // NOW add event listeners after modal is in DOM
    if (presets.length > 0) {
      const updateMultiSelectButton = () => {
        const multiSelectBtn = document.getElementById('multi-preset-share-btn');
        if (!multiSelectBtn) return;
        
        const selectedCount = modal.querySelectorAll('.preset-checkbox:checked').length;
        
        console.log(`[Group Presets] ${selectedCount} presets selected`);
        
        if (selectedCount > 1) {
          multiSelectBtn.style.display = 'block';
          multiSelectBtn.style.background = 'linear-gradient(135deg, #1877f2 0%, #0e5dc7 100%)';
          multiSelectBtn.style.border = 'none';
          multiSelectBtn.innerHTML = `🚀 Send to Unique Groups in ${selectedCount} Selected Presets`;
          multiSelectBtn.onclick = () => {
            const selectedCheckboxes = modal.querySelectorAll('.preset-checkbox:checked');
            const selectedPresetIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-preset-id'));
            
            if (selectedPresetIds.length === 0) return;
            
            modal.remove();
            showMergedPresetsConfirmation(selectedPresetIds, presets);
          };
        } else if (selectedCount === 1) {
          // For single selection, apply directly
          multiSelectBtn.style.display = 'block';
          multiSelectBtn.style.background = 'rgba(76, 217, 100, 0.3)';
          multiSelectBtn.style.border = '2px solid rgba(76, 217, 100, 0.6)';
          multiSelectBtn.innerHTML = '✓ Apply This Preset';
          multiSelectBtn.onclick = async () => {
            const selectedCheckbox = modal.querySelector('.preset-checkbox:checked');
            const presetId = selectedCheckbox.getAttribute('data-preset-id');
            modal.remove();
            if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.applyGroupPresetOnFacebook) {
                await window.ShareUnlimited.UI.applyGroupPresetOnFacebook(presetId);
            }
          };
        } else {
          multiSelectBtn.style.display = 'none';
        }
      };
      
      // Add event listeners to all checkboxes NOW that they're in the DOM
      document.querySelectorAll('.preset-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          console.log(`[Group Presets] Checkbox changed, checked=${e.target.checked}`);
          updateMultiSelectButton();
        });
      });
    }
  }

  /**
   * Shows confirmation modal with merged groups from multiple presets
   */
  function showMergedPresetsConfirmation(selectedPresetIds, allPresets) {
    // Get selected presets
    const selectedPresets = allPresets.filter(p => selectedPresetIds.includes(p.id));
    
    // Merge groups and remove duplicates
    const mergedGroupsSet = new Set();
    selectedPresets.forEach(preset => {
      preset.groups.forEach(group => mergedGroupsSet.add(group));
    });
    
    const uniqueGroups = Array.from(mergedGroupsSet);
    const totalGroupsBeforeMerge = selectedPresets.reduce((sum, p) => sum + p.groups.length, 0);
    const duplicatesRemoved = totalGroupsBeforeMerge - uniqueGroups.length;
    
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.id = 'share-unlimited-merged-presets-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 999999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
      border-radius: 16px;
      padding: 32px;
      max-width: 700px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      width: 90%;
    `;
    
    // Create buttons first
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancel-merged-share';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
      flex: 1;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    
    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'confirm-merged-share';
    confirmBtn.textContent = `🚀 Share Now with ${selectedPresets.length} Group List${selectedPresets.length > 1 ? 's' : ''} (${uniqueGroups.length} Group${uniqueGroups.length > 1 ? 's' : ''} Total)`;
    confirmBtn.style.cssText = `
      flex: 2;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      border: none;
      color: white;
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(76, 217, 100, 0.4);
      position: relative;
      z-index: 999999999;
      pointer-events: auto;
    `;
    
    // Attach event listeners BEFORE adding to DOM
    cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.3)'; });
    cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.2)'; });
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('[Merged Presets] Cancel button clicked');
      modal.remove();
      showGroupPresetsModal();
    });
    
    confirmBtn.addEventListener('mouseenter', () => {
      confirmBtn.style.transform = 'translateY(-2px)';
      confirmBtn.style.boxShadow = '0 6px 20px rgba(76, 217, 100, 0.6)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
      confirmBtn.style.transform = 'translateY(0)';
      confirmBtn.style.boxShadow = '0 4px 15px rgba(76, 217, 100, 0.4)';
    });
    confirmBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('[Merged Presets] Confirm button clicked - opening post content modal with', uniqueGroups.length, 'groups');
      
      // Disable button to prevent double clicks
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.5';
      confirmBtn.style.cursor = 'not-allowed';
      
      // Force remove modal from DOM
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      
      // Ensure modal is gone before creating new one
      requestAnimationFrame(() => {
        showPostContentModal(uniqueGroups);
      });
    }, true); // USE CAPTURE MODE to intercept event before modal background
    
    // Build modal content
    modalContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🎯</div>
        <h2 style="color: white; margin: 0 0 12px 0; font-size: 28px; font-weight: 700;">
          Sharing to ${selectedPresets.length} Group List${selectedPresets.length > 1 ? 's' : ''}
        </h2>
        <p style="color: rgba(255, 255, 255, 0.95); margin: 0 0 12px 0; font-size: 16px; line-height: 1.6;">
          ${duplicatesRemoved > 0 ? 
            `✅ We removed <strong style="color: #4CAF50;">${duplicatesRemoved} duplicate${duplicatesRemoved > 1 ? 's' : ''}</strong> so don't worry!<br>` : 
            '✅ No duplicates found!<br>'}
          Each group will only receive 1 share.
        </p>
      </div>
      
      <div style="background: rgba(45, 136, 255, 0.2); border: 2px solid rgba(45, 136, 255, 0.5); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 24px;">📋</span>
          <div>
            <div style="color: white; font-size: 18px; font-weight: 700;">Selected Presets:</div>
            ${selectedPresets.map(p => `<div style="color: rgba(255, 255, 255, 0.9); font-size: 14px;">• ${p.name} (${p.groups.length} groups)</div>`).join('')}
          </div>
        </div>
      </div>
      
      <div style="background: rgba(76, 217, 100, 0.2); border: 2px solid rgba(76, 217, 100, 0.5); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 24px;">✨</span>
          <span style="color: white; font-size: 18px; font-weight: 700;">
            ${uniqueGroups.length} Unique Group${uniqueGroups.length > 1 ? 's' : ''}
          </span>
        </div>
        <div style="max-height: 300px; overflow-y: auto; background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 12px;">
          ${uniqueGroups.map((g, i) => `
            <div style="color: rgba(255, 255, 255, 0.95); font-size: 13px; padding: 6px 8px; margin: 4px 0; background: rgba(255, 255, 255, 0.1); border-radius: 6px;">
              ${i + 1}. ${g}
            </div>
          `).join('')}
        </div>
      </div>
      
      <div id="button-container" style="display: flex; gap: 12px;"></div>
    `;
    
    // Append buttons to container
    const buttonContainer = modalContent.querySelector('#button-container');
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        console.log('[Merged Presets] Modal background clicked');
        modal.remove();
        showGroupPresetsModal();
      }
    });
  }

  /**
   * Shows dialog to save selected groups as a Group List Preset
   */
  function showSaveGroupListPresetDialog(selectedGroups) {
    const existing = document.getElementById('share-unlimited-save-preset-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'share-unlimited-save-preset-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 999999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">💾</div>
            <h2 style="color: white; margin: 0 0 12px 0; font-size: 24px; font-weight: 700;">Save as Group List Preset</h2>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 14px; line-height: 1.6;">
                By saving this group list you can easily apply it next time when you want to share to these same groups!
            </p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="color: white; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                📋 ${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected
            </p>
        </div>
        
        <div style="margin-bottom: 24px;">
            <label style="color: white; display: block; margin-bottom: 8px; font-size: 15px; font-weight: 600;">
                Name your Group List Preset
            </label>
            <input 
                type="text" 
                id="preset-name-input" 
                placeholder="e.g., My Favorite Groups, Tech Communities..." 
                style="
                    width: 100%;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-family: inherit;
                    box-sizing: border-box;
                    outline: none;
                "
            />
        </div>
        
        <div style="display: flex; gap: 12px;">
            <button id="cancel-save-preset" style="
                flex: 1;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">Cancel</button>
            
            <button id="confirm-save-preset" style="
                flex: 2;
                background: rgba(76, 217, 100, 0.3);
                border: 2px solid rgba(76, 217, 100, 0.6);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">💾 Save Preset</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const nameInput = modal.querySelector('#preset-name-input');
    const cancelBtn = modal.querySelector('#cancel-save-preset');
    const confirmBtn = modal.querySelector('#confirm-save-preset');
    
    cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.3)'; });
    cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.2)'; });
    cancelBtn.addEventListener('click', () => modal.remove());
    
    confirmBtn.addEventListener('mouseenter', () => { confirmBtn.style.background = 'rgba(76, 217, 100, 0.5)'; });
    confirmBtn.addEventListener('mouseleave', () => { confirmBtn.style.background = 'rgba(76, 217, 100, 0.3)'; });
    confirmBtn.addEventListener('click', async () => {
        const presetName = nameInput.value.trim();
        
        if (!presetName) {
            alert('Please enter a name for your Group List Preset!');
            nameInput.focus();
            return;
        }
        
        // Save the preset
        const result = await new Promise(resolve => {
            chrome.storage.local.get(['groupPresets'], resolve);
        });
        
        const presets = result.groupPresets || [];
        
        const newPreset = {
            id: Date.now().toString(),
            name: presetName,
            groups: selectedGroups,
            createdAt: new Date().toISOString()
        };
        
        presets.push(newPreset);
        
        await new Promise(resolve => {
            chrome.storage.local.set({ groupPresets: presets }, resolve);
        });
        
        // Show success message
        modal.remove();
        if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.showSuccessNotification) {
          window.ShareUnlimited.UI.showSuccessNotification(`✓ Group List Preset "${presetName}" saved successfully!`);
        }
        
        // Update the Group Presets button badge if it exists
        const groupPresetsBtn = document.querySelector('#share-unlimited-group-presets-btn');
        if (groupPresetsBtn) {
            groupPresetsBtn.innerHTML = `📖 Group Presets <span style="background: rgba(76, 217, 100, 0.4); padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 4px;">${presets.length}</span>`;
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    nameInput.focus();
  }

  /**
   * Shows dialog to save post content as a Post Template
   */
  function showSavePostTemplateDialog(postContent) {
    const existing = document.getElementById('share-unlimited-save-post-template-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'share-unlimited-save-post-template-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 999999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    const preview = postContent.substring(0, 100) + (postContent.length > 100 ? '...' : '');
    
    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">📝</div>
            <h2 style="color: white; margin: 0 0 12px 0; font-size: 24px; font-weight: 700;">Save as Post Template</h2>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 14px; line-height: 1.6;">
                Save this post content as a reusable template!
            </p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="color: white; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                📋 Post Preview
            </p>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 13px; line-height: 1.4;">
                ${preview}
            </p>
        </div>
        
        <div style="margin-bottom: 24px;">
            <label style="color: white; display: block; margin-bottom: 8px; font-size: 15px; font-weight: 600;">
                Name your Post Template
            </label>
            <input 
                type="text" 
                id="post-template-name-input" 
                placeholder="e.g., My Product Ad, Daily Update..." 
                style="
                    width: 100%;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-family: inherit;
                    box-sizing: border-box;
                    outline: none;
                "
            />
        </div>
        
        <div style="display: flex; gap: 12px;">
            <button id="cancel-save-post-template" style="
                flex: 1;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">Cancel</button>
            
            <button id="confirm-save-post-template" style="
                flex: 2;
                background: rgba(76, 217, 100, 0.3);
                border: 2px solid rgba(76, 217, 100, 0.6);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">📝 Save Template</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const nameInput = modal.querySelector('#post-template-name-input');
    const cancelBtn = modal.querySelector('#cancel-save-post-template');
    const confirmBtn = modal.querySelector('#confirm-save-post-template');
    
    cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.3)'; });
    cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.2)'; });
    cancelBtn.addEventListener('click', () => modal.remove());
    
    confirmBtn.addEventListener('mouseenter', () => { confirmBtn.style.background = 'rgba(76, 217, 100, 0.5)'; });
    confirmBtn.addEventListener('mouseleave', () => { confirmBtn.style.background = 'rgba(76, 217, 100, 0.3)'; });
    confirmBtn.addEventListener('click', () => {
        const templateName = nameInput.value.trim();
        
        if (!templateName) {
            alert('Please enter a name for your Post Template!');
            nameInput.focus();
            return;
        }
        
        // Save the template
        chrome.storage.local.get(['postTemplates'], (result) => {
            const postTemplates = result.postTemplates || {};
            
            // Check if template name already exists
            if (postTemplates[templateName]) {
                if (!confirm(`A template named "${templateName}" already exists. Replace it?`)) {
                    return;
                }
            }
            
            postTemplates[templateName] = postContent;
            
            chrome.storage.local.set({ postTemplates }, () => {
                modal.remove();
                if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.showSuccessNotification) {
                  window.ShareUnlimited.UI.showSuccessNotification(`✓ Post Template "${templateName}" saved successfully!`);
                }
            });
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    nameInput.focus();
  }

  /**
   * Shows dialog to apply a Post Template to the textarea
   */
  function showApplyPostTemplateDialog(textarea) {
    const existing = document.getElementById('share-unlimited-apply-post-template-modal');
    if (existing) existing.remove();
    
    chrome.storage.local.get(['postTemplates'], (result) => {
        const postTemplates = result.postTemplates || {};
        const templateKeys = Object.keys(postTemplates);
        
        const modal = document.createElement('div');
        modal.id = 'share-unlimited-apply-post-template-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 999999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
            border-radius: 16px;
            padding: 24px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        `;
        
        const title = document.createElement('h2');
        title.textContent = '📖 Apply Post Template';
        title.style.cssText = `
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 24px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
        `;
        closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.3)'; });
        closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.2)'; });
        closeBtn.addEventListener('click', () => modal.remove());
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        if (templateKeys.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.style.cssText = `
                text-align: center;
                padding: 40px 20px;
                color: white;
            `;
            emptyState.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                <p style="font-size: 18px; margin-bottom: 8px;">No Post Templates Yet</p>
                <p style="opacity: 0.8;">Save your first template to use it here!</p>
            `;
            modalContent.appendChild(emptyState);
        } else {
            templateKeys.forEach(templateName => {
                const card = document.createElement('div');
                card.style.cssText = `
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                    backdrop-filter: blur(10px);
                    transition: all 0.2s;
                    cursor: pointer;
                `;
                card.addEventListener('mouseenter', () => {
                    card.style.background = 'rgba(255, 255, 255, 0.2)';
                    card.style.transform = 'translateY(-2px)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.background = 'rgba(255, 255, 255, 0.15)';
                    card.style.transform = 'translateY(0)';
                });
                
                const preview = postTemplates[templateName].substring(0, 100) + (postTemplates[templateName].length > 100 ? '...' : '');
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">📝</span>
                            <span style="color: white; font-size: 18px; font-weight: 600;">${templateName}</span>
                        </div>
                        <button class="apply-template-btn" data-template-name="${templateName}" style="
                            background: rgba(76, 217, 100, 0.3);
                            border: 2px solid rgba(76, 217, 100, 0.6);
                            color: white;
                            padding: 8px 20px;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                        ">✓ Apply</button>
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; line-height: 1.4;">
                        ${preview}
                    </div>
                `;
                
                modalContent.appendChild(card);
            });
            
            modalContent.querySelectorAll('.apply-template-btn').forEach(btn => {
                btn.addEventListener('mouseenter', (e) => {
                    e.target.style.background = 'rgba(76, 217, 100, 0.5)';
                    e.target.style.transform = 'scale(1.05)';
                });
                btn.addEventListener('mouseleave', (e) => {
                    e.target.style.background = 'rgba(76, 217, 100, 0.3)';
                    e.target.style.transform = 'scale(1)';
                });
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const templateName = e.target.getAttribute('data-template-name');
                    textarea.value = postTemplates[templateName];
                    modal.remove();
                    if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.showSuccessNotification) {
                      window.ShareUnlimited.UI.showSuccessNotification(`✓ Applied template "${templateName}"!`);
                    }
                });
            });
        }
        
        modal.appendChild(modalContent);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
    });
  }

  /**
   * Shows 1 Click Presets modal directly on Facebook
   */
  async function showOneClickPresetsModal() {
    const existing = document.getElementById('share-unlimited-presets-modal');
    if (existing) existing.remove();
    
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['oneClickTemplates'], resolve);
    });
    
    const templates = result.oneClickTemplates || [];
    
    const modal = document.createElement('div');
    modal.id = 'share-unlimited-presets-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 99999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
      border-radius: 16px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '⚡ 1 Click Share Templates';
    title.style.cssText = `
      color: white;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 24px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.3)'; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.2)'; });
    closeBtn.addEventListener('click', () => modal.remove());
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    modalContent.appendChild(header);
    
    if (templates.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.style.cssText = `
        text-align: center;
        padding: 40px 20px;
        color: white;
      `;
      emptyState.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
        <p style="font-size: 18px; margin-bottom: 8px;">No Templates Yet</p>
        <p style="opacity: 0.8;">Create templates from the extension popup to use them here!</p>
      `;
      modalContent.appendChild(emptyState);
    } else {
      templates.forEach(template => {
        const card = document.createElement('div');
        card.style.cssText = `
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.2s;
        `;
        card.addEventListener('mouseenter', () => {
          card.style.background = 'rgba(255, 255, 255, 0.2)';
          card.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.background = 'rgba(255, 255, 255, 0.15)';
          card.style.transform = 'translateY(0)';
        });
        
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">⚡</span>
              <span style="color: white; font-size: 18px; font-weight: 600;">${template.name}</span>
            </div>
            <button class="use-template-btn" data-template-id="${template.id}" style="
              background: rgba(76, 217, 100, 0.3);
              border: 2px solid rgba(76, 217, 100, 0.6);
              color: white;
              padding: 8px 20px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            ">🚀 Use Now</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>📖</span>
              <span>Group List: ${template.groupPresetName} (${template.groupCount} groups)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>📝</span>
              <span>Post Template: ${template.postTemplateName}</span>
            </div>
          </div>
        `;
        
        modalContent.appendChild(card);
      });
      
      modalContent.querySelectorAll('.use-template-btn').forEach(btn => {
        btn.addEventListener('mouseenter', (e) => {
          e.target.style.background = 'rgba(76, 217, 100, 0.5)';
          e.target.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseleave', (e) => {
          e.target.style.background = 'rgba(76, 217, 100, 0.3)';
          e.target.style.transform = 'scale(1)';
        });
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const templateId = e.target.getAttribute('data-template-id');
          modal.remove();
          if (window.ShareUnlimited.Core && window.ShareUnlimited.Core.useOneClickTemplateDirectly) {
            await window.ShareUnlimited.Core.useOneClickTemplateDirectly(templateId);
          }
        });
      });
    }
    
    modal.appendChild(modalContent);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  }

  // Export functions
  Object.assign(UI, {
    showLicenseExpiredModal,
    showPostContentModal,
    showGroupPresetsModal,
    showMergedPresetsConfirmation,
    showSaveGroupListPresetDialog,
    showSavePostTemplateDialog,
    showApplyPostTemplateDialog,
    showOneClickPresetsModal
  });

})();
