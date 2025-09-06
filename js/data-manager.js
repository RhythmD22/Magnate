// Data Manager for Magnate application
// Centralized management of all application data

window.MagnateData = window.MagnateData || {};

// Default data structures
MagnateData.defaultCategories = [
  { id: 1, name: "Entertainment", budget: 100 },
  { id: 2, name: "Academic", budget: 150 },
  { id: 3, name: "Food", budget: 300 }
];

MagnateData.defaultGoals = [
  { id: 1, title: "Emergency Fund", description: "Save $1000 by December 2025", current: 450, target: 1000, sanitized: true }
];

// Data storage
MagnateData.expenses = [];
MagnateData.incomes = [];
MagnateData.categories = [];
MagnateData.goals = [];
MagnateData.monthlyBudgets = {};
MagnateData.categoryBudgets = {};
MagnateData.calcHistory = [];
MagnateData.notes = "";
MagnateData.currentWeekStart = null;

/**
 * Load all data from localStorage
 */
MagnateData.loadData = function () {
  try {
    MagnateData.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  } catch (e) {
    console.error('Error parsing expenses from localStorage:', e);
    MagnateData.expenses = [];
  }

  try {
    MagnateData.incomes = JSON.parse(localStorage.getItem('incomes')) || [];
  } catch (e) {
    console.error('Error parsing incomes from localStorage:', e);
    MagnateData.incomes = [];
  }

  try {
    const storedCategories = JSON.parse(localStorage.getItem('categories'));
    MagnateData.categories = storedCategories && storedCategories.length > 0 ?
      storedCategories : [...MagnateData.defaultCategories];
  } catch (e) {
    console.error('Error parsing categories from localStorage:', e);
    MagnateData.categories = [...MagnateData.defaultCategories];
  }

  try {
    const storedGoals = JSON.parse(localStorage.getItem('goals'));
    MagnateData.goals = storedGoals && storedGoals.length > 0 ?
      storedGoals : [...MagnateData.defaultGoals];
    // Ensure all goals have the sanitized flag
    MagnateData.goals.forEach(goal => {
      if (goal.sanitized === undefined) {
        goal.sanitized = true;
      }
    });
  } catch (e) {
    console.error('Error parsing goals from localStorage:', e);
    MagnateData.goals = [...MagnateData.defaultGoals];
  }

  try {
    MagnateData.monthlyBudgets = JSON.parse(localStorage.getItem('monthlyBudgets')) || {};
  } catch (e) {
    console.error('Error parsing monthlyBudgets from localStorage:', e);
    MagnateData.monthlyBudgets = {};
  }

  try {
    MagnateData.categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets')) || {};
  } catch (e) {
    console.error('Error parsing categoryBudgets from localStorage:', e);
    MagnateData.categoryBudgets = {};
  }

  try {
    MagnateData.calcHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];
  } catch (e) {
    console.error('Error parsing calcHistory from localStorage:', e);
    MagnateData.calcHistory = [];
  }

  MagnateData.notes = localStorage.getItem('notes') || '';

  try {
    MagnateData.currentWeekStart = localStorage.getItem('currentWeekStart') ?
      new Date(localStorage.getItem('currentWeekStart')) : MagnateUtils.getMonday(new Date());
  } catch (e) {
    console.error('Error parsing currentWeekStart from localStorage:', e);
    MagnateData.currentWeekStart = MagnateUtils.getMonday(new Date());
  }
};

/**
 * Save all data to localStorage
 */
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
  }
};

/**
 * Get category by name (case insensitive)
 * @param {string} name - Category name
 * @returns {object|null} - Category object or null if not found
 */
MagnateData.getCategoryByName = function (name) {
  if (!name) return null;
  return MagnateData.categories.find(cat =>
    cat.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get transaction groups for the current week
 * @returns {array} - Array of transaction groups
 */
MagnateData.getTransactionGroups = function (weekStart) {
  if (!weekStart) weekStart = MagnateData.currentWeekStart;

  // Get date range for current week
  let startStr = MagnateUtils.getLocalDateString(weekStart);
  let weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  let endStr = MagnateUtils.getLocalDateString(weekEndDate);

  // Filter transactions for the current week
  let weekExpenses = MagnateData.expenses.filter(item => {
    try {
      let itemDateObj = MagnateUtils.parseLocalDateString(item.date);
      let startDateObj = MagnateUtils.parseLocalDateString(startStr);
      let endDateObj = MagnateUtils.parseLocalDateString(endStr);
      return itemDateObj >= startDateObj && itemDateObj <= endDateObj;
    } catch (e) {
      console.warn('Invalid date in expense item:', item.date, item);
      return false;
    }
  });

  let weekIncomes = MagnateData.incomes.filter(item => {
    try {
      let itemDateObj = MagnateUtils.parseLocalDateString(item.date);
      let startDateObj = MagnateUtils.parseLocalDateString(startStr);
      let endDateObj = MagnateUtils.parseLocalDateString(endStr);
      return itemDateObj >= startDateObj && itemDateObj <= endDateObj;
    } catch (e) {
      console.warn('Invalid date in income item:', item.date, item);
      return false;
    }
  });

  // Get all unique categories from both expenses and incomes for the current week
  const allTransactions = [...weekExpenses, ...weekIncomes];
  const categories = [...new Set(allTransactions.map(t => t.category))];

  // Create groups for each category
  return categories.map(category => {
    const categoryExpenses = weekExpenses.filter(e => e.category === category);
    const categoryIncomes = weekIncomes.filter(i => i.category === category);

    // Calculate total for this category
    const totalExpenses = categoryExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const totalIncomes = categoryIncomes.reduce((sum, i) => sum + Math.abs(i.amount), 0);

    return {
      category: category,
      expenses: categoryExpenses,
      incomes: categoryIncomes,
      total: totalIncomes - totalExpenses // Incomes are positive, expenses are negative
    };
  });
};

// Initialize data on load
MagnateData.loadData();