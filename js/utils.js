// Shared utility functions for Magnate application
// This file contains common functions used across multiple JavaScript files

/**
 * Prompt user for a number with validation
 * @param {string} message - The prompt message to display
 * @returns {number|null} - The parsed number or null if cancelled
 */
function promptNumber(message) {
  let input;
  do {
    input = prompt(message);
    if (input === null) return null;
  } while (isNaN(parseFloat(input)) || input.trim() === "");
  return parseFloat(input);
}

/**
 * Get Monday of a given date
 * @param {Date} d - The date to get Monday for
 * @returns {Date} - The Monday date
 */
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(date.setDate(diff));
}

/**
 * Generate a unique ID based on current timestamp
 * @returns {number} - Unique ID
 */
function generateId() {
  return Date.now();
}

/**
 * Parse a local date string in either MM/DD/YYYY or YYYY-MM-DD format
 * @param {string} dateString - The date string to parse
 * @returns {Date} - The parsed Date object
 */
function parseLocalDateString(dateString) {
  // Check date format and parse accordingly
  if (dateString.includes("-")) {
    const [year, month, day] = dateString.split("-");
    return new Date(+year, +month - 1, +day);
  }
  const [month, day, year] = dateString.split("/");
  return new Date(+year, +month - 1, +day);
}

/**
 * Get local date string in MM/DD/YYYY format
 * @param {Date} d - The date to format
 * @returns {string} - Formatted date string
 */
function getLocalDateString(d) {
  const tempDate = new Date(d);
  tempDate.setMinutes(tempDate.getMinutes() - tempDate.getTimezoneOffset());
  return tempDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format ISO date string for display in prompts
 * @param {string} isoDateString - The ISO date string to format
 * @returns {string} - Formatted date string
 */
function formatDateForPrompt(isoDateString) {
  // For ISO date strings (YYYY-MM-DD), we want to display them as MM/DD/YYYY
  if (isoDateString && isoDateString.includes("-")) {
    const [year, month, day] = isoDateString.split("-");
    return `${month}/${day}/${year}`;
  }
  return isoDateString;
}

/**
 * Prompt user for a date with validation
 * @param {string} message - The prompt message to display
 * @param {Date} defaultDate - The default date to use if user doesn't provide one
 * @returns {string|null} - The validated date string or null if cancelled
 */
function promptDate(message, defaultDate) {
  defaultDate = defaultDate || new Date();
  let defaultString = getLocalDateString(defaultDate);
  let dateInput;

  do {
    dateInput = prompt(message + " (MM/DD/YYYY) or leave blank for " + defaultString + ":");
    if (dateInput === null) return null;
    dateInput = dateInput.trim();

    if (dateInput === "") {
      return defaultString;
    }

    // Validate MM/DD/YYYY format
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateInput)) {
      alert("Please enter a valid date in MM/DD/YYYY format.");
      continue;
    }

    // Parse and validate the date
    const [month, day, year] = dateInput.split("/");
    const dateObj = new Date(year, month - 1, day);

    // Check if the date is valid
    if (dateObj.getFullYear() != year || dateObj.getMonth() != month - 1 || dateObj.getDate() != day) {
      alert("Please enter a valid date.");
      continue;
    }

    return dateInput;

  } while (true);
}

/**
 * Save all data to localStorage
 */
function saveData() {
  // Save expenses
  if (typeof expenses !== 'undefined') {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  // Save incomes
  if (typeof incomes !== 'undefined') {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }

  // Save categories
  if (typeof categories !== 'undefined') {
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  // Save goals
  if (typeof goals !== 'undefined') {
    localStorage.setItem('goals', JSON.stringify(goals));
  }

  // Save monthly budgets
  if (typeof monthlyBudgets !== 'undefined') {
    localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
  }

  // Save category budgets
  if (typeof categoryBudgets !== 'undefined') {
    localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
  }

  // Save current week start
  if (typeof currentWeekStart !== 'undefined') {
    localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
  }
}

// Make functions available globally
window.promptNumber = promptNumber;
window.getMonday = getMonday;
window.generateId = generateId;
window.parseLocalDateString = parseLocalDateString;
window.getLocalDateString = getLocalDateString;
window.formatDateForPrompt = formatDateForPrompt;
window.promptDate = promptDate;
window.saveData = saveData;