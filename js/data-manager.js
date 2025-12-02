/**
 * MagnateData namespace
 * @namespace MagnateData
 * @description Centralized management of all application data
 */

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
 * Helper function to safely load JSON data from localStorage
 * @param {string} key - The localStorage key to retrieve
 * @param {any} defaultValue - The default value to return if parsing fails
 * @returns {any} - The parsed data or default value
 */
function loadJSONData(key, defaultValue) {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    return defaultValue;
  }
}

/**
 * Load all data from localStorage
 */
MagnateData.loadData = function () {
  MagnateData.expenses = loadJSONData('expenses', []);
  MagnateData.incomes = loadJSONData('incomes', []);

  const storedCategories = loadJSONData('categories', null);
  MagnateData.categories = storedCategories && storedCategories.length > 0 ?
    storedCategories : [...MagnateData.defaultCategories];

  let storedGoals = loadJSONData('goals', null);
  MagnateData.goals = storedGoals && storedGoals.length > 0 ?
    storedGoals : [...MagnateData.defaultGoals];
  // Ensure all goals have the sanitized flag
  MagnateData.goals.forEach(goal => {
    if (goal.sanitized === undefined) {
      goal.sanitized = true;
    }
  });

  MagnateData.monthlyBudgets = loadJSONData('monthlyBudgets', {});
  MagnateData.categoryBudgets = loadJSONData('categoryBudgets', {});
  MagnateData.calcHistory = loadJSONData('calcHistory', []);

  MagnateData.notes = localStorage.getItem('notes') || '';

  try {
    let savedDate = localStorage.getItem('currentWeekStart') ?
      new Date(localStorage.getItem('currentWeekStart')) : MagnateUtils.getMonday(new Date());

    // Ensure the date is at the start of the day to avoid timezone issues
    savedDate.setHours(0, 0, 0, 0);
    MagnateData.currentWeekStart = savedDate;
  } catch (e) {
    console.error('Error parsing currentWeekStart from localStorage:', e);
    let date = MagnateUtils.getMonday(new Date());
    date.setHours(0, 0, 0, 0);  // Ensure at start of day
    MagnateData.currentWeekStart = date;
  }
};

/**
 * Validate data before saving to prevent corrupt data
 * @private
 */
MagnateData._validateData = function () {
  // Validate that arrays are actually arrays
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

  // Validate that objects are actually objects
  if (typeof MagnateData.monthlyBudgets !== 'object' || MagnateData.monthlyBudgets === null) {
    console.warn('Monthly budgets is not an object, resetting to empty object');
    MagnateData.monthlyBudgets = {};
  }

  if (typeof MagnateData.categoryBudgets !== 'object' || MagnateData.categoryBudgets === null) {
    console.warn('Category budgets is not an object, resetting to empty object');
    MagnateData.categoryBudgets = {};
  }

  // Validate that notes is a string
  if (typeof MagnateData.notes !== 'string') {
    console.warn('Notes is not a string, resetting to empty string');
    MagnateData.notes = '';
  }
};

/**
 * Save all data to localStorage
 */
MagnateData.saveData = function () {
  try {
    // Validate data before saving
    MagnateData._validateData();

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
  // Find category with case insensitive comparison
  return MagnateData.categories.find(cat =>
    cat.name.toLowerCase() === name.toLowerCase()) || null;
};

/**
 * Filter transactions by date range
 * @private
 * @param {Array} transactions - Array of transactions to filter
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Array} - Filtered transactions
 */
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

  // Normalize all date strings to YYYY-MM-DD format for consistent comparison
  const normalizedStart = MagnateUtils.normalizeDateFormat(startStr);
  const normalizedEnd = MagnateUtils.normalizeDateFormat(endStr);

  // Filter transactions using the helper function
  const weekExpenses = MagnateData._filterTransactionsByDate(MagnateData.expenses, normalizedStart, normalizedEnd);
  const weekIncomes = MagnateData._filterTransactionsByDate(MagnateData.incomes, normalizedStart, normalizedEnd);

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