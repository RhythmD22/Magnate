// Store references to event listeners for potential cleanup
const eventListeners = [];

// Helper function to add event listener and store reference for cleanup
function addListener(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
  }
}

// Helper function to update all elements' states
function updateSidebarState(isActive) {
  if (sidebar) sidebar.classList.toggle('active', isActive);
  if (hamburger) hamburger.classList.toggle('active', isActive);
  if (backdrop) backdrop.classList.toggle('active', isActive);
  if (swipeFeedback) {
    swipeFeedback.classList.remove('active');
    swipeFeedback.style.width = '10px';
  }
}

const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

// Verify that required elements exist before continuing
if (!hamburger || !sidebar) {
  console.error('Required navigation elements not found');
  // Exit gracefully if navigation elements are not present
  return;
}

// Create backdrop element
const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
document.body.appendChild(backdrop);

// Create swipe feedback element
const swipeFeedback = document.createElement('div');
swipeFeedback.className = 'swipe-feedback';
document.body.appendChild(swipeFeedback);

addListener(hamburger, 'click', () => {
  updateSidebarState(!sidebar.classList.contains('active'));
});

// Close sidebar when clicking on backdrop
addListener(backdrop, 'click', () => {
  updateSidebarState(false);
});

// Touch variables for swipe detection
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const minSwipeDistance = 50;
const maxSwipeDistance = 300; // Maximum distance for swipe to be considered
const maxVerticalScroll = 30; // Maximum vertical movement to prevent interfering with scroll

// Function to handle swipe gestures
function handleSwipe() {
  const swipeDistanceX = touchEndX - touchStartX;
  const swipeDistanceY = Math.abs(touchEndY - touchStartY);

  // Check if vertical movement is minimal (to avoid interfering with scroll)
  if (swipeDistanceY < maxVerticalScroll) {
    // Check if it's a left swipe (negative direction) and meets minimum distance
    if (swipeDistanceX < -minSwipeDistance && sidebar.classList.contains('active')) {
      // Close sidebar
      updateSidebarState(false);
    }
    // Check if it's a right swipe (positive direction) and meets minimum distance
    else if (swipeDistanceX > minSwipeDistance && !sidebar.classList.contains('active') && touchStartX <= 50) {
      // Open sidebar only if swipe started near the left edge (to avoid interfering with browser back)
      updateSidebarState(true);
    }
  }
}

// Add swipe detection to the entire container for better UX
const container = document.querySelector('.container');

if (container) {
  addListener(container, 'touchstart', (e) => {
    // Prevent swipe feedback if touch starts on the hamburger menu
    if (e.target.closest('#hamburger')) {
      return;
    }

    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;

    // Show swipe feedback only if touch starts near the left edge
    if (touchStartX <= 50 && !sidebar.classList.contains('active')) {
      swipeFeedback.classList.add('active');
    }
  }, { passive: true });

  addListener(container, 'touchmove', (e) => {
    // Prevent swipe feedback if touch starts on the hamburger menu
    if (e.target.closest('#hamburger')) {
      return;
    }

    // Update swipe feedback position during swipe
    if (touchStartX <= 50 && !sidebar.classList.contains('active')) {
      const currentX = e.changedTouches[0].screenX;
      const deltaX = currentX - touchStartX;

      // Only show feedback for right swipes within reasonable bounds
      if (deltaX > 0 && deltaX < 100) {
        swipeFeedback.style.width = deltaX + 'px';
      }
    }
  }, { passive: true });

  addListener(container, 'touchend', (e) => {
    // Prevent swipe feedback if touch starts on the hamburger menu
    if (e.target.closest('#hamburger')) {
      return;
    }

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();

    // Hide swipe feedback
    swipeFeedback.classList.remove('active');
    swipeFeedback.style.width = '10px';
  }, { passive: true });
}

// Also add swipe detection to the sidebar for closing
addListener(sidebar, 'touchstart', (e) => {
  // Prevent swipe detection if touch starts on interactive elements
  if (e.target.closest('a, button')) {
    return;
  }

  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

addListener(sidebar, 'touchend', (e) => {
  // Prevent swipe detection if touch ends on interactive elements
  if (e.target.closest('a, button')) {
    return;
  }

  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
}, { passive: true });

// Cleanup function to remove event listeners when page unloads
window.addEventListener('beforeunload', () => {
  eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });

  // Remove dynamically created elements
  if (backdrop && backdrop.parentNode) {
    backdrop.parentNode.removeChild(backdrop);
  }
  if (swipeFeedback && swipeFeedback.parentNode) {
    swipeFeedback.parentNode.removeChild(swipeFeedback);
  }
});