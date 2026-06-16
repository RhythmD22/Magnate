(function () {
  'use strict';

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

  document.addEventListener('DOMContentLoaded', function () {
    const lm = MagnateUtils.createListenerManager();

    const loadingSplash = document.getElementById('loadingSplash');
    if (loadingSplash) {
      loadingSplash.classList.add('fade-out');

      setTimeout(() => {
        if (loadingSplash && loadingSplash.parentNode) {
          loadingSplash.parentNode.removeChild(loadingSplash);
        }
      }, 300);
    }

    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
      const clickHandler = function () {
        getStartedBtn.classList.add('clicked');
        setTimeout(() => {
          window.location.href = "Goals%20%26%20Categories.html";
        }, 300);
      };
      lm.add(getStartedBtn, 'click', clickHandler);
    }

    const featureCards = document.querySelectorAll('.card');
    featureCards.forEach(card => {
      const mouseEnterHandler = function () {
        this.style.zIndex = '10';
      };
      const mouseLeaveHandler = function () {
        this.style.zIndex = '1';
      };

      lm.add(card, 'mouseenter', mouseEnterHandler);
      lm.add(card, 'mouseleave', mouseLeaveHandler);
    });

    window.addEventListener('beforeunload', function () {
      lm.cleanup();
    });
  });
})();