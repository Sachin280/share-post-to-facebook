// content_ui.js - UI components and styling
(function() {
  'use strict';

  // Initialize Namespace
  window.ShareUnlimited = window.ShareUnlimited || {};
  window.ShareUnlimited.UI = {};
  
  const UI = window.ShareUnlimited.UI;
  const State = window.ShareUnlimited.State;
  // Core will be available as window.ShareUnlimited.Core

  // --- Styles & Overlay ---

  /**
   * Creates and shows an animated progress overlay on the Facebook page
   */
  function createProgressOverlay() {
    // Remove any existing overlay
    const existing = document.getElementById('share-unlimited-progress-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'share-unlimited-progress-overlay';
    overlay.innerHTML = `
      <div class="su-overlay-content">
        <div class="su-overlay-header" id="su-drag-handle">
          <div class="su-brand">
            <div class="su-brand-icon">🚀</div>
            <span class="su-brand-text">Multiple Group Share Assistant</span>
            <span class="su-drag-hint">✋ Drag me</span>
          </div>
          <div class="su-header-buttons">
            <button class="su-minimize-btn" id="su-minimize-btn" title="Minimize">−</button>
            <button class="su-cancel-btn" id="su-cancel-share" title="Cancel">✕</button>
          </div>
        </div>
        
        <div class="su-progress-section">
          <div class="su-current-group" id="su-current-group">
            Preparing to share...
          </div>
          
          <div class="su-progress-container">
            <div class="su-progress-bar" id="su-progress-bar">
              <div class="su-progress-fill"></div>
              <div class="su-progress-shimmer"></div>
            </div>
            <div class="su-progress-text" id="su-progress-text">0 / 0</div>
          </div>
          
          <div class="su-status-message" id="su-status-message">
            <span class="su-status-icon">⏳</span>
            <span>Starting share process...</span>
          </div>

          <div class="su-countdown-timer" id="su-countdown-timer" style="display: none;">
            <div class="su-countdown-content">
              <span>Next post in: <span class="su-countdown-time"></span>s</span>
              <button class="su-skip-btn" id="su-skip-countdown" title="Skip wait">Skip ⏭️</button>
            </div>
          </div>
        </div>
        
        <div class="su-groups-list" id="su-groups-list">
          <!-- Groups will be added here dynamically -->
        </div>
      </div>
    `;
    
    // Add styles including Select All animations
    const styles = document.createElement('style');
    styles.textContent = `
      @keyframes shimmer {
        0% {
          transform: translateX(-100%) translateY(-100%) rotate(45deg);
        }
        100% {
          transform: translateX(100%) translateY(100%) rotate(45deg);
        }
      }
      
      @keyframes selectAllPulse {
        0%, 100% {
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        50% {
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.7);
        }
      }
      
      #share-unlimited-progress-overlay {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        animation: slideDown 0.4s ease-out;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      
      .su-overlay-content {
        background: linear-gradient(135deg, #242526 0%, #1a1a1a 100%);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
        padding: 20px;
        min-width: 400px;
        max-width: 500px;
        backdrop-filter: blur(10px);
      }
      
      .su-overlay-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .su-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .su-brand-icon {
        font-size: 24px;
        animation: pulse 2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      .su-brand-text {
        font-size: 18px;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .su-drag-hint {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        margin-left: 8px;
        font-weight: 400;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      #su-drag-handle {
        cursor: move;
        user-select: none;
      }
      
      #su-drag-handle:hover .su-drag-hint {
        opacity: 1;
      }
      
      .su-header-buttons {
        display: flex;
        gap: 8px;
      }
      
      .su-minimize-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 4px 12px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 400;
        cursor: pointer;
        transition: all 0.2s;
        line-height: 1;
      }
      
      .su-minimize-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }
      
      .su-cancel-btn {
        padding: 4px 12px;
        font-size: 16px;
        line-height: 1;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .su-cancel-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      .su-progress-section {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        backdrop-filter: blur(10px);
      }
      
      .su-current-group {
        color: white;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        text-align: center;
        min-height: 24px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      
      .su-progress-container {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .su-progress-bar {
        flex: 1;
        height: 12px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .su-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        border-radius: 6px;
        width: 0%;
        transition: width 0.5s ease-out;
        box-shadow: 0 2px 8px rgba(79, 172, 254, 0.5);
      }
      
      .su-progress-shimmer {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: shimmer 2s infinite;
      }
      
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      .su-progress-text {
        color: white;
        font-size: 14px;
        font-weight: 700;
        min-width: 60px;
        text-align: right;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      
      .su-status-message {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        justify-content: center;
      }
      
      .su-status-icon {
        font-size: 16px;
        animation: spin 2s linear infinite;
      }
  
      .su-countdown-timer {
        margin-top: 12px;
        padding: 8px;
        background: rgba(0,0,0,0.2);
        border-radius: 8px;
        text-align: center;
        color: white;
        font-size: 14px;
        font-weight: 500;
      }
  
      .su-countdown-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
  
      .su-countdown-time {
        font-weight: 700;
        font-size: 16px;
      }
  
      .su-skip-btn {
        background: rgba(255, 255, 255, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: white;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        flex-shrink: 0;
      }
  
      .su-skip-btn:hover {
        background: rgba(255, 255, 255, 0.35);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
  
      .su-skip-btn:active {
        transform: translateY(0);
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .su-groups-list {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 12px;
        max-height: 200px;
        overflow-y: auto;
        backdrop-filter: blur(10px);
      }
      
      .su-groups-list::-webkit-scrollbar {
        width: 6px;
      }
      
      .su-groups-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }
      
      .su-groups-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      
      .su-group-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        margin-bottom: 6px;
        border-radius: 8px;
        transition: all 0.3s;
        color: white;
        font-size: 14px;
      }
      
      .su-group-item.pending {
        background: rgba(255, 255, 255, 0.1);
        opacity: 0.6;
      }
      
      .su-group-item.active {
        background: rgba(79, 172, 254, 0.3);
        border: 1px solid rgba(79, 172, 254, 0.5);
        animation: activeGlow 1.5s ease-in-out infinite;
      }
      
      @keyframes activeGlow {
        0%, 100% { box-shadow: 0 0 10px rgba(79, 172, 254, 0.3); }
        50% { box-shadow: 0 0 20px rgba(79, 172, 254, 0.6); }
      }
      
      .su-group-item.completed {
        background: rgba(76, 217, 100, 0.2);
        border: 1px solid rgba(76, 217, 100, 0.4);
      }
      
      .su-group-item.failed {
        background: rgba(255, 59, 48, 0.2);
        border: 1px solid rgba(255, 59, 48, 0.4);
      }
      
      .su-group-icon {
        font-size: 18px;
        min-width: 24px;
        text-align: center;
      }
      
      .su-group-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .su-completion-message {
        text-align: center;
        padding: 20px;
        color: white;
        font-size: 18px;
        font-weight: 600;
        animation: fadeIn 0.5s;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      
      .su-completion-icon {
        font-size: 48px;
        margin-bottom: 12px;
        animation: bounce 0.6s;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `;
    
    document.head.appendChild(styles);
    document.body.appendChild(overlay);
    
    // Add cancel button handler
    document.getElementById('su-cancel-share').addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel the sharing process?')) {
        State.shareProcessCancelled = true;
        updateProgressOverlay({
          status: '❌ Cancelled',
          message: 'Share process cancelled by user'
        });
        setTimeout(() => removeProgressOverlay(), 2000);
      }
    });
    
    // Add minimize button handler
    let isMinimized = false;
    const minimizeBtn = document.getElementById('su-minimize-btn');
    const progressSection = overlay.querySelector('.su-progress-section');
    const groupsList = overlay.querySelector('.su-groups-list');
    
    minimizeBtn.addEventListener('click', () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        progressSection.style.display = 'none';
        groupsList.style.display = 'none';
        minimizeBtn.textContent = '+';
        minimizeBtn.title = 'Restore';
      } else {
        progressSection.style.display = 'block';
        groupsList.style.display = 'block';
        minimizeBtn.textContent = '−';
        minimizeBtn.title = 'Minimize';
      }
    });
    
    // Add skip button handler
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'su-skip-countdown') {
        console.log('Skip button clicked');
        State.countdownSkipRequested = true;
      }
    });
    
    // Add drag functionality
    const dragHandle = document.getElementById('su-drag-handle');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    dragHandle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
      const transform = overlay.style.transform;
      if (transform && transform !== 'none') {
        const matrix = transform.match(/translate\((.+?)px,\s*(.+?)px\)/);
        if (matrix) {
          xOffset = parseFloat(matrix[1]);
          yOffset = parseFloat(matrix[2]);
        }
      }
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      
      if (e.target === dragHandle || dragHandle.contains(e.target)) {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
          return;
        }
        isDragging = true;
        dragHandle.style.cursor = 'grabbing';
      }
    }
    
    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        
        overlay.style.transform = `translate(${currentX}px, ${currentY}px)`;
        overlay.style.left = '50%';
        overlay.style.top = '60px';
      }
    }
    
    function dragEnd() {
      if (isDragging) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        dragHandle.style.cursor = 'move';
      }
    }
    
    return overlay;
  }

  /**
   * Updates the progress overlay with current status
   */
  function updateProgressOverlay(data) {
    const overlay = document.getElementById('share-unlimited-progress-overlay');
    if (!overlay) return;
    
    if (data.current !== undefined && data.total !== undefined) {
      const percentage = (data.current / data.total) * 100;
      const progressFill = overlay.querySelector('.su-progress-fill');
      const progressText = overlay.querySelector('#su-progress-text');
      
      if (progressFill) progressFill.style.width = percentage + '%';
      if (progressText) progressText.textContent = `${data.current} / ${data.total}`;
    }
    
    if (data.groupName) {
      const currentGroup = overlay.querySelector('#su-current-group');
      if (currentGroup) currentGroup.textContent = `Sharing to: ${data.groupName}`;
    }
    
    if (data.status) {
      const statusMessage = overlay.querySelector('#su-status-message');
      if (statusMessage) {
        statusMessage.innerHTML = `<span class="su-status-icon">${data.status}</span><span>${data.message || ''}</span>`;
      }
    }
  }

  /**
   * Updates the countdown timer in the on-page overlay.
   */
  function updateCountdownOverlay(time) {
    const countdownTimer = document.getElementById('su-countdown-timer');
    if (!countdownTimer) return;

    if (time > 0) {
      const timeSpan = countdownTimer.querySelector('.su-countdown-time');
      countdownTimer.style.display = 'block';
      if (timeSpan) timeSpan.textContent = time;
    } else {
      countdownTimer.style.display = 'none';
    }
  }

  /**
   * Initializes the groups list in the overlay
   */
  function initializeGroupsList(groupNames) {
    const groupsList = document.getElementById('su-groups-list');
    if (!groupsList) return;
    
    groupsList.innerHTML = groupNames.map((name, index) => `
      <div class="su-group-item pending" id="su-group-${index}">
        <span class="su-group-icon">⏳</span>
        <span class="su-group-name">${name}</span>
      </div>
    `).join('');
  }

  /**
   * Updates a specific group's status in the overlay
   */
  function updateGroupStatus(index, status) {
    const groupItem = document.getElementById(`su-group-${index}`);
    if (!groupItem) return;
    
    groupItem.className = 'su-group-item ' + status;
    
    const icon = groupItem.querySelector('.su-group-icon');
    if (icon) {
      switch(status) {
        case 'active':
          icon.textContent = '🚀';
          break;
        case 'completed':
          icon.textContent = '✅';
          break;
        case 'failed':
          icon.textContent = '❌';
          break;
        default:
          icon.textContent = '⏳';
      }
    }
  }

  /**
   * Shows completion message in the overlay
   */
  function showCompletionMessage(success, successCount, totalCount) {
    const overlay = document.getElementById('share-unlimited-progress-overlay');
    if (!overlay) return;
    
    const content = overlay.querySelector('.su-overlay-content');
    if (!content) return;
    
    const icon = success ? '🎉' : '⚠️';
    const message = success 
      ? `Successfully shared to all ${totalCount} groups!`
      : `Shared to ${successCount} of ${totalCount} groups`;
    
    content.innerHTML = `
      <div class="su-completion-message">
        <div class="su-completion-icon">${icon}</div>
        <div>${message}</div>
      </div>
    `;
    
    setTimeout(() => removeProgressOverlay(), 4000);
  }

  /**
   * Removes the progress overlay
   */
  function removeProgressOverlay() {
    const overlay = document.getElementById('share-unlimited-progress-overlay');
    if (overlay) {
      overlay.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => overlay.remove(), 300);
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
      
      const button = document.createElement('button');
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
          width: 100%;
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
      
      buttonContainer.appendChild(button);
      
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
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 24px;
        padding: 36px;
        max-width: 640px;
        width: 90%;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
    `;
    
    // Build the modal content step by step to conditionally add elements
    let modalHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="color: white; margin: 0; font-size: 24px;">⚡ Quick Share</h2>
            <button id="close-post-modal" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 24px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            ">✕</button>
        </div>
        
        <!-- Enticing Save Group List Preset CTA -->
        <div id="save-preset-cta" style="
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%);
            border: 2px solid rgba(255, 193, 7, 0.6);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
            cursor: pointer;
            transition: all 0.3s;
        ">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">💾</span>
                <div style="flex: 1;">
                    <div style="color: white; font-size: 16px; font-weight: 700; margin-bottom: 4px;">
                        💡 Save this group list for future use?
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 13px; line-height: 1.4;">
                        You're sharing to <strong>${selectedGroups.length} groups</strong>. Save this as a preset to instantly select these groups next time without searching!
                    </div>
                </div>
            </div>
            <button id="save-group-list-preset" style="
                width: 100%;
                background: rgba(255, 193, 7, 0.4);
                border: 2px solid rgba(255, 193, 7, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">💾 Yes, Save as Group List Preset</button>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="color: white; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                📋 Sharing to ${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''}
            </p>
            <div style="max-height: 100px; overflow-y: auto;">
                ${selectedGroups.map(g => `
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 13px; padding: 4px 0;">
                        • ${g}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="color: white; font-size: 14px; font-weight: 600;">
                    📝 Post Content (Optional)
                </label>
                <div id="apply-template-container"></div>
            </div>
            <textarea id="quick-share-post-content" placeholder="Type your message here (or leave empty to share without text)..." style="
                width: 100%;
                height: 150px;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                resize: vertical;
                box-sizing: border-box;
            "></textarea>
        </div>
        
        <div id="save-template-container" style="margin-bottom: 12px;"></div>
        
        <div style="display: flex; gap: 12px;">
            <button id="cancel-quick-share" style="
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
            
            <button id="confirm-quick-share" style="
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
            ">🚀 Share Now</button>
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
    
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.3)'; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.2)'; });
    closeBtn.addEventListener('click', () => modal.remove());
    
    cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.3)'; });
    cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.2)'; });
    cancelBtn.addEventListener('click', () => modal.remove());
    
    confirmBtn.addEventListener('mouseenter', () => { confirmBtn.style.background = 'rgba(76, 217, 100, 0.5)'; });
    confirmBtn.addEventListener('mouseleave', () => { confirmBtn.style.background = 'rgba(76, 217, 100, 0.3)'; });
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
      savePresetBtn.addEventListener('mouseenter', () => { 
        savePresetBtn.style.background = 'rgba(255, 193, 7, 0.6)'; 
        savePresetBtn.style.transform = 'scale(1.02)';
      });
      savePresetBtn.addEventListener('mouseleave', () => { 
        savePresetBtn.style.background = 'rgba(255, 193, 7, 0.4)'; 
        savePresetBtn.style.transform = 'scale(1)';
      });
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
                background: rgba(138, 43, 226, 0.3);
                border: 2px solid rgba(138, 43, 226, 0.6);
                color: white;
                padding: 6px 14px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            `;
            applyTemplateBtn.addEventListener('mouseenter', () => { applyTemplateBtn.style.background = 'rgba(138, 43, 226, 0.5)'; });
            applyTemplateBtn.addEventListener('mouseleave', () => { applyTemplateBtn.style.background = 'rgba(138, 43, 226, 0.3)'; });
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
                background: rgba(138, 43, 226, 0.3);
                border: 2px solid rgba(138, 43, 226, 0.6);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                opacity: 0;
                transform: translateY(-10px);
            `;
            savePostTemplateBtn.addEventListener('mouseenter', () => { savePostTemplateBtn.style.background = 'rgba(138, 43, 226, 0.5)'; });
            savePostTemplateBtn.addEventListener('mouseleave', () => { savePostTemplateBtn.style.background = 'rgba(138, 43, 226, 0.3)'; });
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
   * Injects a "Select All" checkbox into the dialog header or list top
   */
  function addSelectAllCheckbox(dialog) {
      if (dialog.querySelector('#share-unlimited-select-all-container')) return;
      
      // Check if user has expired license - if so, show expired button instead
      chrome.storage.local.get(['authExpiry'], (result) => {
        const { authExpiry } = result;
        const isExpired = !authExpiry || new Date(authExpiry) <= new Date();
        
        if (isExpired) {
          // User is expired - find insertion point and add expired CTA
          const insertLocation = findInsertionLocation(dialog);
          if (insertLocation && window.ExpiredOverlay) {
            window.ExpiredOverlay.createFacebookExpiredButton(insertLocation);
          }
          return;
        }
        
        // User is authorized - proceed with normal button setup
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
                      showOneClickPresetsModal();
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
                      showGroupPresetsModal();
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
            await applyGroupPresetOnFacebook(presetId);
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
    if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.updateQuickShareButtonVisibility) {
      window.ShareUnlimited.UI.updateQuickShareButtonVisibility();
    }
    
    // Remove loading message after 3 seconds
    setTimeout(() => {
      loadingMsg.remove();
      
      // Clean up any lingering modal overlays
      const presetModal = document.getElementById('share-unlimited-group-presets-modal');
      if (presetModal) presetModal.remove();
      
      const mergedModal = document.getElementById('share-unlimited-merged-presets-modal');
      if (mergedModal) mergedModal.remove();
    }, 3000);
    
    // Show warning if not all groups were found
    if (matchedCount < preset.groups.length) {
      setTimeout(() => {
        alert(`⚠️ Only ${matchedCount} of ${preset.groups.length} groups from preset "${preset.name}" were found.\n\nSome groups may no longer be available or have different names.`);
      }, 3500);
    }
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
        showSuccessNotification(`✓ Group List Preset "${presetName}" saved successfully!`);
        
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
                showSuccessNotification(`✓ Post Template "${templateName}" saved successfully!`);
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
                    showSuccessNotification(`✓ Applied template "${templateName}"!`);
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
    createProgressOverlay,
    updateProgressOverlay,
    updateCountdownOverlay,
    initializeGroupsList,
    updateGroupStatus,
    showCompletionMessage,
    removeProgressOverlay,
    addQuickShareButton,
    updateQuickShareButtonVisibility,
    showLicenseExpiredModal,
    showPostContentModal,
    addSelectAllCheckbox,
    addCheckboxesToGroups,
    showOneClickPresetsModal,
    showGroupPresetsModal,
    applyGroupPresetOnFacebook,
    showSaveGroupListPresetDialog,
    showSavePostTemplateDialog,
    showApplyPostTemplateDialog,
    showSuccessNotification,
    addMultiGroupButtons
  });

})();
