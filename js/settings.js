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
    var importBtn = document.getElementById('importData');
    var resetBtn = document.getElementById('resetData');

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        if (window.MagnateCSV) MagnateCSV.exportCSV();
      });
    }
    if (importBtn) {
      importBtn.addEventListener('click', function () {
        if (window.MagnateCSV) MagnateCSV.importCSV();
      });
    }
    if (resetBtn) resetBtn.addEventListener('click', resetData);
  });
})();