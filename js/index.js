// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js')
      .then(function (registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(function (err) {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Redirect logic wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname === '/Financier/index.html') {
    window.location.replace('/Financier/');
  }

  // Hamburger menu toggle and swipe functionality
  // These will run after the DOM is fully loaded as well
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function () {
      // Add animation effect on click
      getStartedBtn.classList.add('clicked');
      setTimeout(() => {
        window.location.href = "Goals%20%26%20Categories.html";
      }, 300);
    });
  }

  // Add hover effects to feature cards
  const featureCards = document.querySelectorAll('.card');
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
    });
  });
});