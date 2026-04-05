// content_ui_progress.js - Progress overlay and status display
(function() {
  'use strict';

  // Initialize Namespace
  window.ShareUnlimited = window.ShareUnlimited || {};
  window.ShareUnlimited.UI = window.ShareUnlimited.UI || {};
  
  const UI = window.ShareUnlimited.UI;
  const State = window.ShareUnlimited.State;

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
        right: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        animation: slideDown 0.4s ease-out;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(20px) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0) translateY(0);
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

  // Export functions
  Object.assign(UI, {
    createProgressOverlay,
    updateProgressOverlay,
    updateCountdownOverlay,
    initializeGroupsList,
    updateGroupStatus,
    showCompletionMessage,
    removeProgressOverlay
  });

})();
