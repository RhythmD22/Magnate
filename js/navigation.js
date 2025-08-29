// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Swipe to close sidebar functionality
let touchStartX = 0;
let touchEndX = 0;
const minSwipeDistance = 50; // Minimum distance to register as a swipe

// Add touch event listeners to the sidebar for swipe detection
sidebar.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

sidebar.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeDistance = touchEndX - touchStartX;

  // Check if it's a left swipe (negative direction) and meets minimum distance
  if (swipeDistance < -minSwipeDistance) {
    // Only close sidebar if it's currently open
    if (sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      hamburger.classList.remove('active');
    }
  }
}

// Optional: Add swipe detection to the entire container for better UX
const container = document.querySelector('.container');
container.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

container.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });