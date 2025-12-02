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
  // Store references to event listeners for potential cleanup later
  const eventListeners = [];

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
    const clickHandler = function () {
      getStartedBtn.classList.add('clicked');
      setTimeout(() => {
        window.location.href = "Goals%20%26%20Categories.html";
      }, 300);
    };
    getStartedBtn.addEventListener('click', clickHandler);
    eventListeners.push({ element: getStartedBtn, type: 'click', handler: clickHandler });
  }

  // Feature cards hover effects
  const featureCards = document.querySelectorAll('.card');
  featureCards.forEach(card => {
    const mouseEnterHandler = function () {
      this.style.zIndex = '10';
    };
    const mouseLeaveHandler = function () {
      this.style.zIndex = '1';
    };

    card.addEventListener('mouseenter', mouseEnterHandler);
    card.addEventListener('mouseleave', mouseLeaveHandler);

    eventListeners.push({ element: card, type: 'mouseenter', handler: mouseEnterHandler });
    eventListeners.push({ element: card, type: 'mouseleave', handler: mouseLeaveHandler });
  });

  // Cleanup function to remove event listeners when page unloads
  window.addEventListener('beforeunload', () => {
    eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
  });
});