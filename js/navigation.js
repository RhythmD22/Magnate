const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

// Create backdrop element
const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
document.body.appendChild(backdrop);

// Create swipe feedback element
const swipeFeedback = document.createElement('div');
swipeFeedback.className = 'swipe-feedback';
document.body.appendChild(swipeFeedback);

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  hamburger.classList.toggle('active');
  backdrop.classList.toggle('active');
});

// Close sidebar when clicking on backdrop
backdrop.addEventListener('click', () => {
  sidebar.classList.remove('active');
  hamburger.classList.remove('active');
  backdrop.classList.remove('active');
  swipeFeedback.classList.remove('active');
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
      sidebar.classList.remove('active');
      hamburger.classList.remove('active');
      backdrop.classList.remove('active');
      swipeFeedback.classList.remove('active');
    }
    // Check if it's a right swipe (positive direction) and meets minimum distance
    else if (swipeDistanceX > minSwipeDistance && !sidebar.classList.contains('active') && touchStartX <= 50) {
      // Open sidebar only if swipe started near the left edge (to avoid interfering with browser back)
      sidebar.classList.add('active');
      hamburger.classList.add('active');
      backdrop.classList.add('active');
      swipeFeedback.classList.remove('active');
    }
  }
}

// Add swipe detection to the entire container for better UX
const container = document.querySelector('.container');

container.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;

  // Show swipe feedback only if touch starts near the left edge
  if (touchStartX <= 50 && !sidebar.classList.contains('active')) {
    swipeFeedback.classList.add('active');
  }
}, { passive: true });

container.addEventListener('touchmove', (e) => {
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

container.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();

  // Hide swipe feedback
  swipeFeedback.classList.remove('active');
  swipeFeedback.style.width = '10px';
}, { passive: true });

// Also add swipe detection to the sidebar for closing
sidebar.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

sidebar.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
}, { passive: true });