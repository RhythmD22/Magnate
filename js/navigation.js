const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  // Only apply on mobile devices (when hamburger is visible)
  if (window.innerWidth <= 768) {
    // Check if sidebar is currently open
    if (sidebar.classList.contains('active')) {
      // Check if the click is outside the sidebar and hamburger button
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
      }
    }
  }
});

// Swipe to close sidebar functionality
let touchStartX = 0;
let touchEndX = 0;
const minSwipeDistance = 50;

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

// Add swipe detection to the entire container for better UX
const container = document.querySelector('.container');
container.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

container.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });