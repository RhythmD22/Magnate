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
    const cardLinks = {
      cardGoalSetting: 'Goals%20%26%20Categories.html',
      cardExpenseTracking: 'Track%20Transactions.html',
      cardVisualAnalytics: 'Analytics.html'
    };

    featureCards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');

      const navigate = function () {
        const page = cardLinks[card.id];
        if (page) {
          card.classList.add('clicked');
          setTimeout(() => {
            window.location.href = page;
          }, 200);
        }
      };

      lm.add(card, 'click', navigate);
      lm.add(card, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate();
        }
      });

      lm.add(card, 'mouseenter', function () {
        this.style.zIndex = '10';
      });
      lm.add(card, 'mouseleave', function () {
        this.style.zIndex = '1';
      });
    });

    window.addEventListener('beforeunload', function () {
      lm.cleanup();
    });
  });
})();