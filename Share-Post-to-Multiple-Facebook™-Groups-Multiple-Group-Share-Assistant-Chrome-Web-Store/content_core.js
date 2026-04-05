// content_core.js - Core logic and helpers
(function() {
  'use strict';

  // Initialize Namespace
  window.ShareUnlimited = window.ShareUnlimited || {};
  window.ShareUnlimited.Core = {};
  window.ShareUnlimited.State = {
    shareProcessCancelled: false,
    isSharingInProgress: false,
    countdownSkipRequested: false,
    cachedShareButtonLocation: null,
    SHARE_DELAY_MS: 15000 // 15 seconds
  };

  const Core = window.ShareUnlimited.Core;
  const State = window.ShareUnlimited.State;
  // We will reference UI via window.ShareUnlimited.UI later

  // ==================== UNIVERSAL PLATFORM SPOOFING ====================
  /**
   * Ensures ALL users appear as Windows Chrome to Facebook for consistent UI
   * This forces Facebook to serve the same UI elements regardless of actual OS
   */
  function enforceUniversalPlatformSpoofing() {
    console.log('🔍 Platform Detection:');
    console.log('   User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36');
    console.log('   Platform: Win32');
    console.log('   💻 Detected: Windows/Linux/Other');
    console.log('   ℹ️ No User-Agent spoofing needed');
    
    // Force activate User-Agent spoofing for ALL users
    chrome.storage.local.set({
      userAgentSpoofingActive: true,
      spoofedPlatform: 'Windows'
    }, () => {
      console.log('   ✅ Universal User-Agent Spoofing: ENFORCED');
      console.log('   ℹ️ All users will appear as Windows Chrome to Facebook');
    });
  }
  
  // Enforce universal spoofing immediately
  enforceUniversalPlatformSpoofing();
  // ==================== END UNIVERSAL PLATFORM SPOOFING ====================

  // --- Helper Functions ---

  /**
   * A simple delay function.
   * @param {number} ms - The number of milliseconds to wait.
   */
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * A delay function that updates the on-page countdown timer.
   * @param {number} seconds - The number of seconds to wait.
   */
  async function countdown(seconds) {
    return new Promise(resolve => {
      // Reset skip flag at start of countdown
      State.countdownSkipRequested = false;
      
      let remaining = Math.floor(seconds);
      if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.updateCountdownOverlay) {
        window.ShareUnlimited.UI.updateCountdownOverlay(remaining);
      }

      const intervalId = setInterval(() => {
        // Check if skip was requested
        if (State.countdownSkipRequested) {
          console.log('⏭️ Countdown skipped by user');
          clearInterval(intervalId);
          if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.updateCountdownOverlay) {
            window.ShareUnlimited.UI.updateCountdownOverlay(0);
          }
          resolve();
          return;
        }
        
        remaining--;
        if (window.ShareUnlimited.UI && window.ShareUnlimited.UI.updateCountdownOverlay) {
          window.ShareUnlimited.UI.updateCountdownOverlay(remaining);
        }
        
        if (remaining <= 0) {
          clearInterval(intervalId);
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Clicks an element, ensuring it's visible and ready.
   * @param {HTMLElement} element - The element to click.
   */
  async function clickElement(element) {
    if (element) {
      // Check if element is already in viewport
      const rect = element.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );

      if (!isInViewport) {
        console.log('Element not in viewport, scrolling to it...');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(300); // Wait for scroll
      } else {
        console.log('Element already in viewport, skipping scroll');
      }

      // Use standard click
      element.click();
      return true;
    }
    return false;
  }

  /**
   * Recursively searches for elements matching a selector, penetrating Shadow DOM.
   */
  function querySelectorAllDeep(root, selector) {
    let results = [];
    try {
      if (root.querySelectorAll) {
        // 1. Search in the current root
        results.push(...Array.from(root.querySelectorAll(selector)));
        
        // 2. Find all elements with shadowRoots in this level
        const allElements = root.querySelectorAll('*');
        for (const el of allElements) {
          if (el.shadowRoot) {
            // Recursively search within the shadow root
            results.push(...querySelectorAllDeep(el.shadowRoot, selector));
          }
        }
      }
    } catch (e) {
      console.warn('Error in querySelectorAllDeep:', e);
    }
    return results;
  }

  /**
   * Gets the active element, traversing down into Shadow DOMs.
   */
  function getDeepActiveElement() {
    let el = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) {
      el = el.shadowRoot.activeElement;
    }
    return el;
  }

  /**
   * Gets all focusable elements within a container.
   */
  function getFocusableElements(container) {
    const focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]';
    return querySelectorAllDeep(container, focusableSelector).filter(el => {
      const style = window.getComputedStyle(el);
      return el.offsetWidth > 0 && el.offsetHeight > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });
  }

  // --- Facebook Interaction Logic ---

  /**
   * Helper function to extract and validate group name from button text
   * Returns null if the name is invalid, otherwise returns the cleaned group name
   */
  function extractAndValidateGroupName(buttonText) {
    let groupName = buttonText.trim();
    
    // Remove group type indicators
    if (groupName.includes('Public group')) {
      groupName = groupName.split('Public group')[0].trim();
    } else if (groupName.includes('Private group')) {
      groupName = groupName.split('Private group')[0].trim();
    }
    
    // Extract first line only
    const lines = groupName.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    groupName = lines[0];
    
    // Validate the extracted name
    if (groupName && 
        groupName.length > 2 && 
        groupName.length < 100 &&
        !groupName.toLowerCase().includes('search') &&
        !groupName.toLowerCase().includes('close') &&
        !groupName.toLowerCase().includes('back') &&
        !groupName.toLowerCase().includes('all groups')) {
      return groupName;
    }
    
    return null;
  }

  /**
   * Finds the main "Post" button in the dialog.
   */
  function findPostButton() {
      const buttons = document.querySelectorAll('div[role="dialog"] div[role="button"]');
      // console.log(`Searching for Post button among ${buttons.length} buttons`);
      
      for (const button of buttons) {
          const text = button.textContent.trim().toLowerCase();
          const isDisabled = button.getAttribute('aria-disabled') === 'true';
          // console.log(`Button text: "${text}", disabled: ${isDisabled}`);
          
          if (text === 'post' && !isDisabled) {
              console.log('Found enabled Post button!');
              return button;
          }
      }
      console.warn('Post button not found or is disabled');
      return null;
  }

  /**
   * Waits for the Post button to become enabled
   */
  async function waitForPostButton(maxWaitMs = 5000) {
      const startTime = Date.now();
      while (Date.now() - startTime < maxWaitMs) {
          const postButton = findPostButton();
          if (postButton) {
              console.log('Post button is ready!');
              return postButton;
          }
          await sleep(500);
      }
      console.error('Timeout waiting for Post button');
      return null;
  }

  /**
   * Marks a button and caches its location data for later retrieval
   */
  function markAndCacheButton(button) {
    if (!button) return;
    
    // Mark with data attribute
    button.dataset.shareUnlimitedTarget = 'true';
    
    // Cache location and structural data
    const rect = button.getBoundingClientRect();
    const parent = button.parentElement;
    const grandparent = parent ? parent.parentElement : null;
    
    State.cachedShareButtonLocation = {
      // Position data (approximate, for matching after DOM changes)
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      
      // Structural identifiers
      hasShareSvg: button.querySelector('svg path[d*="M12.863"]') !== null,
      parentClasses: parent ? parent.className : '',
      grandparentClasses: grandparent ? grandparent.className : '',
      
      // Timestamp
      cachedAt: Date.now()
    };
    
    console.log('📍 Cached button location data:', State.cachedShareButtonLocation);
  }

  /**
   * Attempts to find a button using cached location data
   */
  function findButtonByLocation(locationData) {
    if (!locationData) return null;
    
    // Don't use stale cache (older than 5 minutes)
    if (Date.now() - locationData.cachedAt > 300000) {
      console.log('⚠️ Cached location data is stale, ignoring');
      return null;
    }
    
    const allButtons = document.querySelectorAll('div[role="button"], div[tabindex="0"]');
    let bestMatch = null;
    let bestScore = 0;
    
    for (const button of allButtons) {
      const rect = button.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      
      let score = 0;
      
      // Position similarity (within 50px tolerance for dynamic layouts)
      const topDiff = Math.abs(rect.top - locationData.top);
      const leftDiff = Math.abs(rect.left - locationData.left);
      if (topDiff < 50 && leftDiff < 50) {
        score += 30;
        score += (50 - topDiff) / 2; // Closer = higher score
        score += (50 - leftDiff) / 2;
      }
      
      // Size similarity
      const widthDiff = Math.abs(rect.width - locationData.width);
      const heightDiff = Math.abs(rect.height - locationData.height);
      if (widthDiff < 20 && heightDiff < 20) {
        score += 10;
      }
      
      // Structural match
      if (locationData.hasShareSvg && button.querySelector('svg path[d*="M12.863"]')) {
        score += 50; // Strong signal - has share SVG
      }
      
      const parent = button.parentElement;
      const grandparent = parent ? parent.parentElement : null;
      if (parent && locationData.parentClasses && parent.className === locationData.parentClasses) {
        score += 15;
      }
      if (grandparent && locationData.grandparentClasses && grandparent.className === locationData.grandparentClasses) {
        score += 10;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = button;
      }
    }
    
    if (bestScore > 50) { // Require reasonable confidence
      console.log(`✓ Found button match with score ${bestScore}`);
      return bestMatch;
    }
    
    console.log(`✗ No confident match found (best score: ${bestScore})`);
    return null;
  }

  /**
   * Finds the original Share button that was clicked on the post
   */
  function findShareButton() {
    // 1. Check for cached/marked button first
    const markedButton = document.querySelector('[data-share-unlimited-target="true"]');
    if (markedButton && document.body.contains(markedButton)) {
        console.log('🎯 Found cached original Share button (data attribute), using it.');
        return markedButton;
    }

    // 2. Try to find button using cached location data (for DOM reconstructions like in reels)
    if (State.cachedShareButtonLocation) {
        console.log('🔍 Attempting to relocate button using cached position data...');
        const relocatedButton = findButtonByLocation(State.cachedShareButtonLocation);
        if (relocatedButton) {
            console.log('✅ Successfully relocated button using position data!');
            markAndCacheButton(relocatedButton);
            return relocatedButton;
        }
    }

    console.log('Searching for Share button on post...');
    
    const candidates = [];

    // Helper to collect candidates
    const collectCandidate = (button, strategy) => {
      if (!button) return;
      if (candidates.some(c => c.element === button)) return;

      const rect = button.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      candidates.push({
        element: button,
        rect: rect,
        strategy: strategy,
        distanceFromCenter: Math.abs((rect.top + rect.height/2) - (window.innerHeight/2))
      });
    };
    
    // Strategy 1: Find by aria-label
    const ariaLabelButtons = document.querySelectorAll('[aria-label]');
    for (const button of ariaLabelButtons) {
      const ariaLabel = button.getAttribute('aria-label').toLowerCase();
      
      if (ariaLabel.includes('boost') || ariaLabel.includes('promote') || ariaLabel.includes('ad')) {
        continue;
      }
      
      if (ariaLabel.includes('send this to friends') || 
          (ariaLabel.includes('share') && button.getAttribute('role') === 'button')) {
        collectCandidate(button, 'aria-label');
      }
    }
    
    // Strategy 2: Find by text in posts
    const posts = document.querySelectorAll('div[role="article"]');
    for (const post of posts) {
      const buttons = post.querySelectorAll('div[role="button"]');
      for (const button of buttons) {
        const text = button.textContent.trim();
        const ariaLabel = button.getAttribute('aria-label') || '';
        
        if ((text === 'Share' || ariaLabel.toLowerCase().includes('share')) &&
            !ariaLabel.toLowerCase().includes('boost') &&
            !ariaLabel.toLowerCase().includes('promote') &&
            !ariaLabel.toLowerCase().includes('ad')) {
          collectCandidate(button, 'post-button-text');
        }
      }
    }
    
    // Strategy 3: Find ICON-ONLY share buttons (for reels/videos)
    const allButtons = document.querySelectorAll('div[role="button"], div[tabindex="0"]');
    for (const button of allButtons) {
      const svg = button.querySelector('svg path[d*="M12.863"]') || 
                   button.querySelector('svg path[d*="8.382"]'); 
      
      if (svg) {
        const ariaLabel = button.getAttribute('aria-label') || '';
        if (!ariaLabel.toLowerCase().includes('boost') && 
            !ariaLabel.toLowerCase().includes('promote')) {
          collectCandidate(button, 'icon-svg');
        }
      }
    }
    
    console.log(`Found ${candidates.length} candidate Share buttons`);
    
    if (candidates.length === 0) {
      console.warn('Could not find any Share button on post');
      return null;
    }

    // Filter for visible candidates
    const visibleCandidates = candidates.filter(c => {
        const r = c.rect;
        return (
            r.top >= 0 &&
            r.left >= 0 &&
            r.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            r.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    });

    if (visibleCandidates.length > 0) {
        visibleCandidates.sort((a, b) => a.rect.top - b.rect.top);
        const bestCandidate = visibleCandidates[visibleCandidates.length - 1];
        console.log(`Selected Share button (Strategy: ${bestCandidate.strategy}, Top: ${Math.round(bestCandidate.rect.top)}px)`);
        
        markAndCacheButton(bestCandidate.element);
        return bestCandidate.element;
    } else {
        console.log('No fully visible buttons, using proximity fallback...');
        candidates.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);
        const bestCandidate = candidates[0];
        console.log(`Selected Share button (Strategy: ${bestCandidate.strategy}, Distance: ${Math.round(bestCandidate.distanceFromCenter)}px)`);
        
        markAndCacheButton(bestCandidate.element);
        return bestCandidate.element;
    }
  }

  /**
   * Extracts group names from the share dialog with their checked status.
   */
  async function getGroupNames() {
    const groupsWithStatus = [];
    
    const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
    
    if (!dialog) {
      console.log('No dialog with aria-labelledby found - not on group selection screen');
      return [];
    }
    
    await sleep(1000);
    
    const allButtons = dialog.querySelectorAll('div[role="button"]');
    
    let groupButtons = [];
    allButtons.forEach((button, index) => {
      const buttonText = button.textContent.trim();
      const buttonTextLength = buttonText.length;
      const hasImage = button.querySelector('image, img, svg') !== null;
      
      const hasGroupIndicator = buttonText.includes('Public group') || 
                               buttonText.includes('Private group') ||
                               buttonText.toLowerCase().includes('members');
      
      if (buttonTextLength > 10 && buttonTextLength < 200 && hasImage && hasGroupIndicator) {
        groupButtons.push({
          element: button,
          text: buttonText,
          index: index
        });
      }
    });
    
    groupButtons.forEach((btn) => {
      let groupName = btn.text.trim();
      
      if (groupName.includes('Public group')) {
        groupName = groupName.split('Public group')[0].trim();
      } else if (groupName.includes('Private group')) {
        groupName = groupName.split('Private group')[0].trim();
      }
      
      const lines = groupName.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      groupName = lines[0];
      
      if (groupName && 
          groupName.length > 2 && 
          groupName.length < 100 &&
          !groupName.toLowerCase().includes('search') &&
          !groupName.toLowerCase().includes('close') &&
          !groupName.toLowerCase().includes('back') &&
          !groupName.toLowerCase().includes('all groups') &&
          !groupsWithStatus.some(g => g.name === groupName)) {
        
        const checkbox = btn.element.querySelector('.multi-share-checkbox');
        const isChecked = checkbox ? checkbox.checked : false;
        
        groupsWithStatus.push({
          name: groupName,
          checked: isChecked
        });
      }
    });
    
    return groupsWithStatus;
  }

  /**
   * Finds a group element by name in the current dialog
   */
  function findGroupElementByName(groupName) {
    console.log(`🔍 Searching for group: "${groupName}"`);
    
    const dialog = document.querySelector('div[role="dialog"][aria-labelledby]');
    
    if (!dialog) {
      console.error('❌ No dialog with aria-labelledby found - group selection dialog is not open!');
      return null;
    }
    
    const allButtons = dialog.querySelectorAll('div[role="button"]');
    
    for (const button of allButtons) {
      const buttonText = button.textContent.trim();
      const buttonTextLength = buttonText.length;
      const hasImage = button.querySelector('image, img, svg') !== null;
      
      if (buttonTextLength > 10 && buttonTextLength < 200 && hasImage) {
        let extractedName = buttonText.trim();
        
        if (extractedName.includes('Public group')) {
          extractedName = extractedName.split('Public group')[0].trim();
        } else if (extractedName.includes('Private group')) {
          extractedName = extractedName.split('Private group')[0].trim();
        }
        
        const lines = extractedName.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        extractedName = lines[0];
        
        if (extractedName === groupName) {
          console.log(`  ✅ FOUND matching group: ${groupName}`);
          return button;
        }
      }
    }
    
    console.error(`❌ Could not find group "${groupName}"`);
    return null;
  }

  /**
   * Finds and clicks the "Group" option in the share menu
   */
  async function clickShareToGroupOption() {
    console.log('Looking for "Group" option in share menu...');
    await sleep(1500); // Wait for menu to appear
    
    const menuItems = document.querySelectorAll('div[role="button"], div[role="menuitem"]');
    
    for (const item of menuItems) {
      const text = item.textContent.trim();
      const ariaLabel = item.getAttribute('aria-label') || '';
      
      // Enhanced matching: Check for "Group" text in spans AND check for group icon
      const hasGroupText = text.includes('Group') && !text.includes('Public group') && !text.includes('Private group');
      const hasGroupIcon = item.querySelector('i[style*="zLpE14dDq86.png"]') !== null || 
                           item.querySelector('div[style*="zLpE14dDq86.png"]') !== null;
      const hasGroupInSpan = Array.from(item.querySelectorAll('span')).some(span => 
        span.textContent.trim() === 'Group'
      );
      
      if ((hasGroupText || hasGroupInSpan) && (hasGroupIcon || text === 'Group')) {
        console.log('Found Group option, clicking:', text);
        
        // Click with multiple methods for reliability
        item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        item.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        await clickElement(item);
        
        await sleep(2000); // Wait for group dialog to open
        return true;
      }
    }
    
    console.error('Could not find Group option in share menu');
    return false;
  }

  /**
   * Re-opens the share dialog by clicking Share button and then "Group"
   * @param {string} targetGroupName - Optional group name to search for during lazy load
   */
  async function reopenShareDialog(targetGroupName = null) {
    if (targetGroupName) {
      console.log(`Attempting to reopen share dialog (target group: "${targetGroupName}")...`);
    } else {
      console.log('Attempting to reopen share dialog...');
    }
    
    const closeButtons = document.querySelectorAll('div[aria-label*="Close"], div[aria-label*="close"]');
    for (const btn of closeButtons) {
      if (btn.closest('div[role="dialog"]')) {
        console.log('Closing existing dialog...');
        await clickElement(btn);
        await sleep(1000);
        break;
      }
    }
    
    const shareButton = findShareButton();
    if (!shareButton) {
      console.error('Could not find Share button to reopen dialog');
      return false;
    }
    
    console.log('Clicking Share button...');
    await clickElement(shareButton);
    await sleep(1500);
    
    const success = await clickShareToGroupOption();
    if (success) {
      await sleep(2000); 
      await scrollToLoadAllGroups(null, targetGroupName);
      console.log('Share dialog reopened successfully');
      return true;
    }
    
    return false;
  }

  /**
   * Scrolls down in the groups list to trigger lazy loading
   * @param {Function} onScrollCallback - Optional callback to run after each scroll
   * @param {string} targetGroupName - Optional group name to search for; stops early if found
   */
  async function scrollToLoadAllGroups(onScrollCallback = null, targetGroupName = null) {
    if (targetGroupName) {
      console.log(`Scrolling to load groups (searching for: "${targetGroupName}")...`);
    } else {
      console.log('Scrolling to load all groups...');
    }
    
    const dialog = document.querySelector('div[role="dialog"][aria-labelledby]'); 
    if (!dialog) {
      console.warn('No group selection dialog found for scrolling');
      return;
    }
    
    const scrollableElements = dialog.querySelectorAll('*');
    let scrollContainer = null;
    let maxScrollHeight = 0;
    
    for (const el of scrollableElements) {
      const style = window.getComputedStyle(el);
      const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll');
      
      if (isScrollable && el.scrollHeight > el.clientHeight) {
          if (el.scrollHeight > maxScrollHeight) {
              maxScrollHeight = el.scrollHeight;
              scrollContainer = el;
          }
      }
    }
    
    if (!scrollContainer) {
      const groupButton = dialog.querySelector('div[role="button"]');
      if (groupButton) {
          let parent = groupButton.parentElement;
          while (parent && parent !== dialog) {
              const style = window.getComputedStyle(parent);
               if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                   scrollContainer = parent;
                   break;
               }
               parent = parent.parentElement;
          }
      }
    }

    if (!scrollContainer) {
      scrollContainer = dialog;
    }
    
    let previousHeight = 0;
    let currentHeight = scrollContainer.scrollHeight;
    let noChangeCount = 0;
    const maxScrolls = 50; 
    
    for (let i = 0; i < maxScrolls; i++) {
      // Check if target group is already visible BEFORE scrolling further
      if (targetGroupName) {
        const foundElement = findGroupElementByName(targetGroupName);
        if (foundElement) {
          console.log(`✅ Target group "${targetGroupName}" found early! Stopping lazy load at scroll iteration ${i}.`);
          scrollContainer.scrollTop = 0;
          return; // Early exit - group found!
        }
      }
      
      scrollContainer.scrollTop = currentHeight;
      await sleep(800);
      
      if (onScrollCallback) {
          try {
              const count = onScrollCallback();
              if (count > 0) console.log(`  Scroll found ${count} new items`);
          } catch (e) {
              console.error('Error in scroll callback:', e);
          }
      }
      
      previousHeight = currentHeight;
      currentHeight = scrollContainer.scrollHeight;
      
      if (currentHeight <= previousHeight) {
          noChangeCount++;
          if (noChangeCount >= 3) break;
      } else {
          noChangeCount = 0;
      }
    }
    
    scrollContainer.scrollTop = 0;
  }

  /**
   * Facebook-Compatible Text Input Function
   */
  async function typeIntoFacebookTextarea(element, text) {
      console.log('Starting Facebook textarea typing...');
      
      const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
      const placeholder = (element.getAttribute('placeholder') || '').toLowerCase();
      if (ariaLabel.includes('search facebook') || placeholder.includes('search facebook') || 
          element.getAttribute('type') === 'search') {
          console.error('❌ CRITICAL: Target appears to be the Search Bar. Aborting.');
          throw new Error('Safety Abort: Target is Search Bar');
      }

      if (element && !element.isContentEditable && element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
          let parent = element.parentElement;
          while (parent) {
              if (parent.isContentEditable || parent.getAttribute('contenteditable') === 'true') {
                  element = parent;
                  break;
              }
              parent = parent.parentElement;
          }
      }

      const isInputElement = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
      const isContentEditable = element.isContentEditable || element.getAttribute('contenteditable') === 'true';

      if (!isInputElement && !isContentEditable) {
          throw new Error('Element is not typable');
      }

      element.focus();
      
      const currentActive = getDeepActiveElement();
      if (currentActive !== element && !element.contains(currentActive)) {
          element.click();
          await sleep(50);
          element.focus();
      }
      
      await sleep(100); 

      // Typing loop
      for (const char of text) {
          if (char === '\n' && isContentEditable) {
              const shiftEnterOptions = {
                  key: 'Enter',
                  code: 'Enter',
                  keyCode: 13,
                  which: 13,
                  shiftKey: true,
                  bubbles: true,
                  cancelable: true,
                  view: window
              };
              
              element.dispatchEvent(new KeyboardEvent('keydown', shiftEnterOptions));
              element.dispatchEvent(new KeyboardEvent('keypress', shiftEnterOptions));
              document.execCommand('insertLineBreak', false, null);
              element.dispatchEvent(new InputEvent('input', {
                  inputType: 'insertLineBreak',
                  bubbles: true,
                  cancelable: true,
                  view: window
              }));
              element.dispatchEvent(new KeyboardEvent('keyup', shiftEnterOptions));
              await sleep(10);
              continue;
          }
          
          const keyCode = char.charCodeAt(0);
          const code = `Key${char.toUpperCase()}`;
          
          const eventOptions = {
              key: char,
              code: code,
              keyCode: keyCode,
              which: keyCode,
              bubbles: true,
              cancelable: true,
              view: window
          };

          element.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
          element.dispatchEvent(new KeyboardEvent('keypress', eventOptions));
          
          if (isInputElement) {
              element.value += char;
          } else if (isContentEditable) {
              document.execCommand('insertText', false, char);
          }
          
          element.dispatchEvent(new InputEvent('input', {
              inputType: 'insertText',
              data: char,
              bubbles: true,
              cancelable: true,
              view: window
          }));
          
          element.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
          await sleep(1);
      }
      
      element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Finds and fills the post text field with the provided content
   */
  async function fillPostContent(postContent) {
    console.log('🔍 Looking for post text field to fill with content...');
    await sleep(2000);
    
    // Find dialogs
    const dialogs = document.querySelectorAll('div[role="dialog"]');
    let createPostDialog = null;
    const dialogsArray = Array.from(dialogs).reverse();
    
    for (const dialog of dialogsArray) {
      const ariaLabel = (dialog.getAttribute('aria-label') || '').toLowerCase();
      const style = window.getComputedStyle(dialog);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && dialog.getBoundingClientRect().width > 0;

      if ((ariaLabel.includes('create post') || ariaLabel.includes('create a post')) && isVisible) {
        createPostDialog = dialog;
        break;
      }
    }
    
    if (!createPostDialog) {
      console.error('❌ Could not find "Create post" dialog');
      return false;
    }
    
    let postInputArea = null;
    const presentationContainers = createPostDialog.querySelectorAll('div[role="presentation"]');
    for (const container of presentationContainers) {
      const hasTextInput = container.querySelector('div[data-lexical-editor="true"]') ||
                          container.querySelector('div[role="textbox"]') ||
                          container.querySelector('div[contenteditable="true"]');
      
      if (hasTextInput) {
        postInputArea = container;
        break;
      }
    }
    
    if (!postInputArea) postInputArea = createPostDialog;
    
    // Interact to create input
    const searchArea = postInputArea || createPostDialog;
    const triggerElements = searchArea.querySelectorAll('div[role="button"], div[tabindex="0"], span, div, label, p, h1, h2, h3, h4, input, textarea');
    const triggerCandidates = [];
    
    for (const trigger of triggerElements) {
      const text = trigger.textContent.trim().toLowerCase();
      const role = trigger.getAttribute('role');
      const ariaLabel = (trigger.getAttribute('aria-label') || '').toLowerCase();
      const rect = trigger.getBoundingClientRect();
      
      if (rect.width === 0 || rect.height === 0) continue;
      if (role === 'heading' || (role === 'button' && (text === 'close' || text === 'post' || text === 'cancel'))) continue;
      if (text === 'create post' || text === 'create a post') continue;

      let score = 0;
      const computedStyle = window.getComputedStyle(trigger);
      if (computedStyle.cursor === 'text') score += 20;

      if (text.includes('create a public post')) score += 50;
      else if (text.includes('write something') || text.includes("what's on your mind")) score += 40;
      else if (text.includes('create a')) score += 10;
      
      if (ariaLabel.includes('create a public post')) score += 50;
      else if (ariaLabel.includes('write something')) score += 40;

      if (score > 0) triggerCandidates.push({ element: trigger, score });
    }
    
    triggerCandidates.sort((a, b) => b.score - a.score);
    
    if (triggerCandidates.length > 0) {
      const trigger = triggerCandidates[0].element;
      trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }
    
    await sleep(1500);
    
    // Find input
    let candidates = [];
    let retryCount = 0;
    
    while (candidates.length === 0 && retryCount < 10) {
      if (retryCount > 0) await sleep(500);
      retryCount++;
      candidates = [];

      const searchRoots = [postInputArea, document.body];
      const iframes = createPostDialog.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          if (doc && doc.body) searchRoots.push(doc.body);
        } catch (e) {}
      });
      
      searchRoots.forEach((root) => {
        // Prioritize the main post editor with specific aria-placeholder
        const mainPostEditors = querySelectorAllDeep(root, 'div[data-lexical-editor="true"][aria-placeholder*="Create a public post"]');
        mainPostEditors.forEach(editor => {
          if (editor.getBoundingClientRect().width > 0) {
            if (!candidates.some(c => c.element === editor)) {
                console.log('✅ Found main post editor with aria-placeholder');
                candidates.push({ element: editor, type: 'main-post-editor', zIndex: 200 }); // Highest priority
            }
          }
        });
        
        // Fallback to other lexical editors (but lower priority)
        if (candidates.length === 0) {
          const lexicalEditors = querySelectorAllDeep(root, 'div[data-lexical-editor="true"], [contenteditable="true"][data-lexical-editor="true"]');
          lexicalEditors.forEach(editor => {
            // Skip if it's in a comment section (aria-label contains "comment" or doesn't have the right placeholder)
            const ariaPlaceholder = editor.getAttribute('aria-placeholder') || '';
            const ariaLabel = editor.getAttribute('aria-label') || '';
            
            if (ariaLabel.toLowerCase().includes('comment')) {
              console.log('⏭️ Skipping comment section editor');
              return;
            }
            
            if (editor.getBoundingClientRect().width > 0) {
              if (!candidates.some(c => c.element === editor)) {
                  candidates.push({ element: editor, type: 'lexical-editor', zIndex: 100 });
              }
            }
          });
        }
      });
      
      if (candidates.length === 0) {
        searchRoots.forEach(root => {
          const inputs = querySelectorAllDeep(root, 'textarea, input[type="text"]');
          inputs.forEach(input => {
             if (input.getBoundingClientRect().width > 0) {
                 candidates.push({ element: input, type: 'input', zIndex: 10 });
             }
          });
        });
      }
    }
    
    if (candidates.length === 0) return false;
    
    const targetElement = candidates[0].element;
    console.log(`🎯 Target element found:`, targetElement);
    console.log(`📋 Element type: ${targetElement.tagName}, contentEditable: ${targetElement.isContentEditable}, data-lexical-editor: ${targetElement.getAttribute('data-lexical-editor')}`);
    
    targetElement.focus();
    targetElement.click();
    await sleep(200);
    
    try {
      await typeIntoFacebookTextarea(targetElement, postContent);
      
      // Verify content was actually entered
      const actualContent = targetElement.isContentEditable ? targetElement.textContent : targetElement.value;
      console.log(`🔍 Content after typing: "${actualContent}"`);
      
      if (!actualContent || actualContent.trim().length === 0) {
        console.error('❌ Content is empty after typing!');
        return false;
      }
      
      console.log('✅ Content verified in element');
      return true;
    } catch (error) {
      console.error('❌ Error typing:', error);
      return false;
    }
  }

  // --- High Level Flows ---

  /**
   * Handles the Quick Share button click
   */
  async function handleQuickShare() {
      console.log('🚀 Quick Share button clicked');
      
      const result = await new Promise(resolve => {
          chrome.storage.local.get(['authExpiry'], resolve);
      });
      
      const authExpiry = result.authExpiry;
      const isAuthorized = authExpiry && new Date(authExpiry) > new Date();
      const isNewUser = !authExpiry; // No expiry date means never started (new user)

      if (!isAuthorized) {
          // If it's a NEW user, show the expired/blocking modal and stop
          if (isNewUser) {
              if (window.ShareUnlimited.UI) window.ShareUnlimited.UI.showLicenseExpiredModal();
              return;
          }
          // If it's an EXPIRED user, proceed! (Watermark will be added in shareToSelectedGroups)
      }
      
      const selectedGroups = [];
      const checkboxes = document.querySelectorAll('.multi-share-checkbox:checked');
      
      checkboxes.forEach(checkbox => {
          const button = checkbox.closest('div[role="button"]');
          if (button) {
              const buttonText = button.textContent.trim();
              let groupName = buttonText;
              
              if (groupName.includes('Public group')) {
                  groupName = groupName.split('Public group')[0].trim();
              } else if (groupName.includes('Private group')) {
                  groupName = groupName.split('Private group')[0].trim();
              }
              
              const lines = groupName.split('\n').map(l => l.trim()).filter(l => l.length > 0);
              groupName = lines[0];
              
              if (groupName && groupName.length > 2) {
                  selectedGroups.push(groupName);
              }
          }
      });
      
      if (selectedGroups.length === 0) {
          alert('No groups selected. Please select at least one group.');
          return;
      }
      
      if (window.ShareUnlimited.UI) window.ShareUnlimited.UI.showPostContentModal(selectedGroups);
  }

  /**
   * The main logic for handling the multi-sharing process.
   */
  async function handleMultiPost() {
    if (window.groupScanInterval) {
        clearInterval(window.groupScanInterval);
        window.groupScanInterval = null;
    }

    const selectedGroups = [];
    const groupElements = document.querySelectorAll('div[role="dialog"] div[role="checkbox"]');

    groupElements.forEach(el => {
      const checkbox = el.querySelector('.multi-share-checkbox');
      const nameElement = el.querySelector('span, div[dir="auto"]');
      if (checkbox && checkbox.checked && nameElement) {
        selectedGroups.push({
          name: nameElement.textContent.trim(),
          element: el
        });
      }
    });

    if (selectedGroups.length === 0) {
      return true; // Proceed with original click
    }

    alert(`Starting multi-share process for ${selectedGroups.length} groups.`);
    const postButton = findPostButton();
    if (!postButton) {
      alert('Could not find the "Post" button. Aborting.');
      return false;
    }

    for (let i = 0; i < selectedGroups.length; i++) {
      const group = selectedGroups[i];
      await clickElement(group.element);
      await sleep(500);
      await clickElement(postButton);
      await clickElement(group.element);
      await sleep(500);

      if (i < selectedGroups.length - 1) {
        await sleep(State.SHARE_DELAY_MS);
      }
    }

    alert('Multi-share process completed!');
    return false;
  }

  /**
   * Shares to multiple groups based on the provided group names.
   */
  async function shareToSelectedGroups(groupNames, postContent = '', postVariations = null, postSignature = null, delaySeconds = 10, randomizeDelay = false) {
    console.log(`📢 shareToSelectedGroups called with postContent: "${postContent}"`);
    console.log(`📊 Groups to share to (${groupNames.length}):`, groupNames);
    
    // === CHECK LICENSE EXPIRY FOR WATERMARK ===
    const isExpired = await new Promise(resolve => {
        chrome.storage.local.get(['authExpiry'], (result) => {
            const { authExpiry } = result;
            // Only consider expired if authExpiry exists (started trial) and is in the past
            resolve(authExpiry && new Date(authExpiry) <= new Date());
        });
    });

    if (isExpired) {
        console.log('⚠️ License expired - appending watermark');
        const watermark = '\n\nBulk Shared using MGSA Chrome Extension';
        
        // Append watermark to signature (or create signature if none)
        if (postSignature) {
            postSignature = postSignature + watermark;
        } else {
            postSignature = watermark.trim(); // Trim because logic later adds \n\n
        }
    }
    // ===============================================

    State.isSharingInProgress = true;
    State.shareProcessCancelled = false;
    const UI = window.ShareUnlimited.UI;
    
    if (window.groupScanInterval) {
        clearInterval(window.groupScanInterval);
        window.groupScanInterval = null;
    }
    
    if (UI) {
      UI.createProgressOverlay();
      UI.initializeGroupsList(groupNames);
      UI.updateProgressOverlay({
        current: 0,
        total: groupNames.length,
        status: '🚀',
        message: 'Initializing...'
      });
    }

    try {
      const originalBtn = findShareButton();
      if (originalBtn) console.log('✅ Original share button identified');
    } catch(e) {}

    if (groupNames.length === 0) {
      State.isSharingInProgress = false;
      return { success: false, message: 'No groups selected' };
    }
    
    const dialogOpen = document.querySelector('div[role="dialog"]');
    if (!dialogOpen) {
      State.isSharingInProgress = false;
      return { success: false, message: 'Share dialog not open.' };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < groupNames.length; i++) {
      if (State.shareProcessCancelled) {
        if (UI) UI.updateGroupStatus(i, 'failed');
        break;
      }
      
      const groupName = groupNames[i];
      if (UI) {
        UI.updateCountdownOverlay(0);
        UI.updateGroupStatus(i, 'active');
        UI.updateProgressOverlay({
          current: i,
          total: groupNames.length,
          groupName: groupName,
          status: '🚀',
          message: `Sharing to ${groupName}...`
        });
      }
      
      chrome.runtime.sendMessage({
        type: 'share_progress',
        current: i + 1,
        total: groupNames.length,
        groupName: groupName
      });
      
      let currentDialog = document.querySelector('div[role="dialog"][aria-labelledby]');
      
      if (i > 0 || !currentDialog) {
        const reopened = await reopenShareDialog(groupName);
        if (!reopened) {
          errorCount++;
          errors.push(`${groupName}: Could not open share dialog`);
          continue;
        }
        await sleep(2000);
      }
      
      const groupElement = findGroupElementByName(groupName);
      if (!groupElement) {
        errorCount++;
        errors.push(`${groupName}: Group not found in dialog`);
        continue;
      }
      
      await clickElement(groupElement);
      await sleep(5000); 
      
      let currentPostContent = postContent;
      if (postVariations && postVariations.length > 0) {
        const variationIndex = i % postVariations.length;
        currentPostContent = postVariations[variationIndex];
      }

      if (postSignature) {
        currentPostContent = currentPostContent.trimEnd() + '\n\n' + postSignature.trim();
      }

      if (currentPostContent) {
        console.log(`📝 Attempting to fill post content: "${currentPostContent.substring(0, 50)}..."`);
        const fillSuccess = await fillPostContent(currentPostContent);
        if (!fillSuccess) {
          console.warn('⚠️ Failed to fill post content, but continuing...');
        } else {
          console.log('✅ Post content filled successfully');
        }
        // Minimal wait to ensure UI updates after Lexical editor changes
        await sleep(isExpired ? 50 : 500); 
      } else {
        console.log('ℹ️ No post content to fill (empty or null)');
      }
      
      const postButton = await waitForPostButton(10000);
      
      if (postButton) {
        // If expired, click immediately to prevent text deletion. Otherwise wait standard time (reduced from 4s).
        const postDelay = isExpired ? 200 : 1000;
        if (isExpired) console.log('⚡ Expired mode: Posting immediately!');
        
        await sleep(postDelay); 
        const clickEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
        postButton.dispatchEvent(clickEvent);
        await sleep(5000); 
        successCount++;
        if (UI) UI.updateGroupStatus(i, 'completed');
      } else {
        errorCount++;
        errors.push(`${groupName}: Post button not found`);
        if (UI) UI.updateGroupStatus(i, 'failed');
      }

      if (i < groupNames.length - 1) {
        let totalDelaySeconds = delaySeconds;
        if (randomizeDelay) {
          totalDelaySeconds += Math.floor(Math.random() * (35 - 15 + 1)) + 15;
        }
        await countdown(totalDelaySeconds);
      }
    }

    if (UI && !State.shareProcessCancelled) {
      UI.showCompletionMessage(errorCount === 0, successCount, groupNames.length);
    }
    
    State.isSharingInProgress = false;
    
    if (successCount === 0) return { success: false, message: `Failed. Errors: ${errors.join(', ')}` };
    if (errorCount > 0) return { success: true, message: `Shared to ${successCount} groups. ${errorCount} failed.`, partialSuccess: true };
    return { success: true, message: `Successfully shared to all ${successCount} groups.` };
  }

  /**
   * Uses a 1 Click Template directly from Facebook
   */
  async function useOneClickTemplateDirectly(templateId) {
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['oneClickTemplates', 'groupPresets', 'postTemplates'], resolve);
    });
    
    const templates = result.oneClickTemplates || [];
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return;
    
    const postContent = (result.postTemplates || {})[template.postTemplateName];
    const groupPreset = (result.groupPresets || []).find(p => p.id === template.groupPresetId);
    
    if (!postContent || !groupPreset) return;
    
    alert(`Starting to share with template "${template.name}"!`);
    
    await shareToSelectedGroups(
      groupPreset.groups,
      postContent,
      null, 
      null, 
      25,   
      false 
    );
  }

  // Export functions
  Object.assign(Core, {
    sleep,
    countdown,
    clickElement,
    querySelectorAllDeep,
    getDeepActiveElement,
    getFocusableElements,
    extractAndValidateGroupName,
    findPostButton,
    waitForPostButton,
    findShareButton,
    markAndCacheButton,
    findButtonByLocation,
    getGroupNames,
    findGroupElementByName,
    clickShareToGroupOption,
    reopenShareDialog,
    scrollToLoadAllGroups,
    typeIntoFacebookTextarea,
    fillPostContent,
    handleQuickShare,
    handleMultiPost,
    shareToSelectedGroups,
    useOneClickTemplateDirectly
  });

})();
