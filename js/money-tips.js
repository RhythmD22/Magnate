(function () {
  'use strict';

  let lm = MagnateUtils.createListenerManager();

  const categoryColors = MagnateTipsData.categoryColors;
  const tipsBank = MagnateTipsData.tipsBank;

  const shuffle = (array) => {
    for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
      const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const generateCardsHTML = (tips) => {
    let cardsHTML = "";
    tips.forEach(tip => {
      cardsHTML += `<div class="tip-card">${tip}</div>`;
    });
    return cardsHTML + cardsHTML;
  };

  function updateButtonStyles(button, isActive, category) {
    const selectedColor = categoryColors[category] || "#4e80ee";

    if (isActive) {
      button.classList.add('active');
      button.style.color = selectedColor;
      button.style.borderColor = selectedColor;
      button.querySelectorAll('svg path').forEach(path => {
        path.setAttribute('fill', selectedColor);
      });
    } else {
      button.classList.remove('active');
      button.style.color = "";
      button.style.borderColor = "";
      button.querySelectorAll('svg path').forEach(path => {
        path.setAttribute('fill', '#508de6');
      });
    }
  }

  const updateTips = (category) => {
    if (!tipsBank[category]) {
      console.warn(`Category "${category}" not found in tipsBank`);
      return;
    }

    const selectedTips = tipsBank[category];
    document.querySelectorAll('.tips-row-inner').forEach(inner => {
      if (inner) {
        const rowTips = shuffle([...selectedTips]);
        inner.innerHTML = generateCardsHTML(rowTips);
      }
    });
  };

  function updateArrowColor(color) {
    const arrowLine = document.querySelector('.arrow-line');
    if (arrowLine) {
      arrowLine.style.backgroundColor = color;
      arrowLine.style.setProperty('--arrow-color', color);
    }
  }

  function setupCategoryButtons() {
    const container = document.querySelector('.categories-wrapper');
    if (!container) {
      lm.add(document, 'click', function (e) {
        const button = e.target.closest('.category-button');
        if (button) {
          handleCategoryButtonClick(button);
        }
      });
      return;
    }

    lm.add(container, 'click', function (e) {
      const button = e.target.closest('.category-button');
      if (button) {
        handleCategoryButtonClick(button);
      }
    });
  }

  function handleCategoryButtonClick(button) {
    const category = button.getAttribute('data-category');
    if (!category) return;

    document.querySelectorAll('.category-button').forEach(b => {
      updateButtonStyles(b, false, null);
    });

    updateButtonStyles(button, true, category);

    const selectedColor = categoryColors[category] || "#4e80ee";
    updateArrowColor(selectedColor);

    updateTips(category);
  }

  function onDOMContentLoaded() {
    setupCategoryButtons();

    const defaultBtn = document.querySelector('.category-button[data-category="finance"]');
    if (defaultBtn) {
      updateButtonStyles(defaultBtn, true, "finance");
      updateTips('finance');
      updateArrowColor(categoryColors["finance"]);
    }

    document.querySelectorAll('.category-button').forEach(btn => {
      const cat = btn.getAttribute('data-category');
      if (cat && categoryColors[cat]) {
        btn.style.setProperty('--category-color', categoryColors[cat]);
      }
    });
  }

  function onLoad() {
    setTimeout(function () {
      document.querySelectorAll('.tips-row').forEach(function (row) {
        if (row) {
          row.classList.add('scroll-animate');
        }
      });
      const tipsRows = document.querySelector('.tips-rows');
      if (tipsRows) tipsRows.style.visibility = 'visible';
      const activeBtn = document.querySelector('.category-button.active');
      if (activeBtn) {
        const activeCategory = activeBtn.getAttribute('data-category');
        updateTips(activeCategory);
      }
    }, 50);
  }

  window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  window.addEventListener('load', onLoad);

  window.addEventListener('beforeunload', function () {
    lm.cleanup();
  });
})();