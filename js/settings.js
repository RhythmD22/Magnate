(function () {
  'use strict';

  var STORAGE_KEYS = [
    'expenses',
    'incomes',
    'categories',
    'goals',
    'monthlyBudgets',
    'categoryBudgets',
    'calcHistory',
    'notes',
    'currentWeekStart'
  ];

  function resetData() {
    MagnateUI.confirm('Delete all your Magnate data? This cannot be undone.').then(function (confirmed) {
      if (!confirmed) return;

      STORAGE_KEYS.forEach(function (key) {
        localStorage.removeItem(key);
      });

      MagnateData.loadData();
      location.reload();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var exportBtn = document.getElementById('exportData');
    var importCSVBtn = document.getElementById('importCSVData');
    var importOFXBtn = document.getElementById('importOFXData');
    var resetBtn = document.getElementById('resetData');

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        if (window.MagnateCSV) MagnateCSV.exportCSV();
      });
    }
    if (importCSVBtn) {
      importCSVBtn.addEventListener('click', function () {
        if (window.MagnateCSV) MagnateCSV.importCSV();
      });
    }
    if (importOFXBtn) {
      importOFXBtn.addEventListener('click', function () {
        if (window.MagnateOFX) MagnateOFX.importOFX();
      });
    }
    if (resetBtn) resetBtn.addEventListener('click', resetData);
  });
})();