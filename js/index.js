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

// DOM Ready Initializations
document.addEventListener('DOMContentLoaded', function () {
  // Redirect from old path
  if (window.location.pathname === '/Financier/index.html') {
    window.location.replace('/Financier/');
  }

  // Hide loading splash screen
  const loadingSplash = document.getElementById('loadingSplash');
  if (loadingSplash) {
    // Add fade-out class to create transition effect
    loadingSplash.classList.add('fade-out');

    // Remove the splash screen from DOM after transition completes
    setTimeout(() => {
      if (loadingSplash && loadingSplash.parentNode) {
        loadingSplash.parentNode.removeChild(loadingSplash);
      }
    }, 300); // 300ms matches the CSS transition time
  }

  // Get Started button animation and navigation
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function () {
      getStartedBtn.classList.add('clicked');
      setTimeout(() => {
        window.location.href = "Goals%20%26%20Categories.html";
      }, 300);
    });
  }

  // Feature cards hover effects
  const featureCards = document.querySelectorAll('.card');
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', function () {
      this.style.zIndex = '1';
    });
  });
});