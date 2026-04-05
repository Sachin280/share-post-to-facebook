// This script draws numbered overlays on top of form fields.

function createOverlays() {
  // Remove any existing overlays first
  document.querySelectorAll('.form-field-overlay').forEach(e => e.remove());

  const fields = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select');
  
  fields.forEach((field, index) => {
    if (field.offsetParent === null) return; // Skip hidden elements

    const rect = field.getBoundingClientRect();
    const overlay = document.createElement('div');
    
    overlay.className = 'form-field-overlay';
    overlay.style.position = 'absolute';
    overlay.style.left = `${window.scrollX + rect.left}px`;
    overlay.style.top = `${window.scrollY + rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.backgroundColor = 'rgba(255, 165, 0, 0.5)';
    overlay.style.color = 'black';
    overlay.style.fontSize = '14px';
    overlay.style.fontWeight = 'bold';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';
    overlay.style.pointerEvents = 'none'; // Allow clicks to pass through
    
    overlay.textContent = `${index + 1}`;
    overlay.dataset.fieldNumber = index + 1;
    
    document.body.appendChild(overlay);
  });

  return fields.length;
}

// The script's main job is to create the overlays.
createOverlays();

// The filling logic is handled by content.js to ensure consistency.
// This script is only responsible for creating the visual overlays.
