(function () {
  'use strict';

  window.MagnateData = window.MagnateData || {};

  MagnateData.defaultCategories = [
    { id: 1, name: "Entertainment", budget: 100 },
    { id: 2, name: "Academic", budget: 150 },
    { id: 3, name: "Food", budget: 300 }
  ];

  MagnateData.defaultGoals = [
    { id: 1, title: "Emergency Fund", description: "Save $1,000 by December 2025", current: 450, target: 1000, sanitized: true }
  ];

  MagnateData.expenses = [];
  MagnateData.incomes = [];
  MagnateData.categories = [];
  MagnateData.goals = [];
  MagnateData.monthlyBudgets = {};
  MagnateData.categoryBudgets = {};
  MagnateData.calcHistory = [];
  MagnateData.notes = "";
  MagnateData.currentWeekStart = null;

  MagnateData._loadJSONData = function (key, defaultValue) {
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : defaultValue;
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage:`, e);
      return defaultValue;
    }
  };

  MagnateData.loadData = function () {
    MagnateData.expenses = MagnateData._loadJSONData('expenses', []);
    MagnateData.incomes = MagnateData._loadJSONData('incomes', []);
    MagnateData._validateData();

    const storedCategories = MagnateData._loadJSONData('categories', null);
    MagnateData.categories = storedCategories && storedCategories.length > 0 ?
      storedCategories : JSON.parse(JSON.stringify(MagnateData.defaultCategories));

    let storedGoals = MagnateData._loadJSONData('goals', null);
    MagnateData.goals = storedGoals && storedGoals.length > 0 ?
      storedGoals : JSON.parse(JSON.stringify(MagnateData.defaultGoals));
    MagnateData.goals.forEach(goal => {
      if (goal.sanitized === undefined) {
        goal.sanitized = true;
      }
    });

    MagnateData.monthlyBudgets = MagnateData._loadJSONData('monthlyBudgets', {});
    MagnateData.categoryBudgets = MagnateData._loadJSONData('categoryBudgets', {});
    MagnateData.calcHistory = MagnateData._loadJSONData('calcHistory', []);

    MagnateData.notes = localStorage.getItem('notes') || '';

    try {
      let savedDate = localStorage.getItem('currentWeekStart') ?
        new Date(localStorage.getItem('currentWeekStart')) : MagnateUtils.getMonday(new Date());

      savedDate.setHours(0, 0, 0, 0);
      MagnateData.currentWeekStart = savedDate;
    } catch (e) {
      console.error('Error parsing currentWeekStart from localStorage:', e);
      let date = MagnateUtils.getMonday(new Date());
      date.setHours(0, 0, 0, 0);
      MagnateData.currentWeekStart = date;
    }
  };

  MagnateData._validateData = function () {
    if (!Array.isArray(MagnateData.expenses)) {
      console.warn('Expenses is not an array, resetting to empty array');
      MagnateData.expenses = [];
    }

    if (!Array.isArray(MagnateData.incomes)) {
      console.warn('Incomes is not an array, resetting to empty array');
      MagnateData.incomes = [];
    }

    if (!Array.isArray(MagnateData.categories)) {
      console.warn('Categories is not an array, resetting to empty array');
      MagnateData.categories = [];
    }

    if (!Array.isArray(MagnateData.goals)) {
      console.warn('Goals is not an array, resetting to empty array');
      MagnateData.goals = [];
    }

    if (!Array.isArray(MagnateData.calcHistory)) {
      console.warn('CalcHistory is not an array, resetting to empty array');
      MagnateData.calcHistory = [];
    }

    if (typeof MagnateData.monthlyBudgets !== 'object' || MagnateData.monthlyBudgets === null) {
      console.warn('Monthly budgets is not an object, resetting to empty object');
      MagnateData.monthlyBudgets = {};
    }

    if (typeof MagnateData.categoryBudgets !== 'object' || MagnateData.categoryBudgets === null) {
      console.warn('Category budgets is not an object, resetting to empty object');
      MagnateData.categoryBudgets = {};
    }

    if (typeof MagnateData.notes !== 'string') {
      console.warn('Notes is not a string, resetting to empty string');
      MagnateData.notes = '';
    }
  };

  MagnateData.saveData = function () {
    try {
      localStorage.setItem('expenses', JSON.stringify(MagnateData.expenses));
      localStorage.setItem('incomes', JSON.stringify(MagnateData.incomes));
      localStorage.setItem('categories', JSON.stringify(MagnateData.categories));
      localStorage.setItem('goals', JSON.stringify(MagnateData.goals));
      localStorage.setItem('monthlyBudgets', JSON.stringify(MagnateData.monthlyBudgets));
      localStorage.setItem('categoryBudgets', JSON.stringify(MagnateData.categoryBudgets));
      localStorage.setItem('calcHistory', JSON.stringify(MagnateData.calcHistory));
      localStorage.setItem('notes', MagnateData.notes);
      if (MagnateData.currentWeekStart) {
        localStorage.setItem('currentWeekStart', MagnateData.currentWeekStart.toISOString());
      }
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.message.includes('quota')) {
        MagnateUI.alert('Storage is full! Your latest changes could not be saved. Please free up space by exporting your data and clearing old entries.');
      }
    }
  };

  MagnateData.getCategoryByName = function (name) {
    if (!name) return null;
    return MagnateData.categories.find(cat =>
      cat.name.toLowerCase() === name.toLowerCase()) || null;
  };

  MagnateData._filterTransactionsByDate = function (transactions, startDate, endDate) {
    return transactions.filter(item => {
      try {
        const normalizedItemDate = MagnateUtils.normalizeDateFormat(item.date);
        const isWithinRange = normalizedItemDate >= startDate && normalizedItemDate <= endDate;
        return isWithinRange;
      } catch (e) {
        console.warn('Invalid date in transaction item:', item.date, item);
        return false;
      }
    });
  };

  MagnateData.getTransactionGroups = function (weekStart) {
    if (!weekStart) weekStart = MagnateData.currentWeekStart;

    const { normalizedStart, normalizedEnd } = MagnateUtils.getWeekDateRange(weekStart);

    const weekExpenses = MagnateData._filterTransactionsByDate(MagnateData.expenses, normalizedStart, normalizedEnd);
    const weekIncomes = MagnateData._filterTransactionsByDate(MagnateData.incomes, normalizedStart, normalizedEnd);

    const allTransactions = [...weekExpenses, ...weekIncomes];
    const categories = [...new Set(allTransactions.map(t => t.category))];

    return categories.map(category => {
      const categoryExpenses = weekExpenses.filter(e => e.category === category);
      const categoryIncomes = weekIncomes.filter(i => i.category === category);

      const totalExpenses = categoryExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
      const totalIncomes = categoryIncomes.reduce((sum, i) => sum + Math.abs(i.amount), 0);

      return {
        category: category,
        expenses: categoryExpenses,
        incomes: categoryIncomes,
        total: totalIncomes - totalExpenses
      };
    });
  };

  MagnateData.loadData();
})();