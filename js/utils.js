// Shared utility functions for Magnate application
// This file contains common functions used across multiple JavaScript files
// All functions are namespaced under MagnateUtils to avoid global conflicts

/**
 * MagnateUtils namespace
 * @namespace MagnateUtils
 */
window.MagnateUtils = window.MagnateUtils || {};

/**
 * Helper function to pad a number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} size - Size of the resulting string
 * @returns {string} - Padded string
 */
MagnateUtils._padNumber = function (num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
};

/**
 * Prompt user for a number with validation
 * @param {string} message - The prompt message to display
 * @returns {number|null} - The parsed number or null if cancelled
 */
MagnateUtils.promptNumber = function (message) {
  let input;
  do {
    input = prompt(message);
    if (input === null) return null;
  } while (isNaN(parseFloat(input)) || input.trim() === "");
  return parseFloat(input);
};

/**
 * Get Monday of a given date
 * @param {Date} d - The date to get Monday for
 * @returns {Date} - The Monday date
 */
MagnateUtils.getMonday = function (d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(date.setDate(diff));
};

/**
 * Generate a unique ID based on current timestamp
 * @returns {number} - Unique ID
 */
MagnateUtils.generateId = function () {
  return Date.now();
};

/**
 * Validate if a date string is a valid date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - Whether the date is valid
 */
MagnateUtils.isValidDateString = function (dateString) {
  if (!dateString) return false;

  // Check date format and parse accordingly
  if (dateString.includes("-")) {
    // Handle ISO date format (YYYY-MM-DD)
    const [year, month, day] = dateString.split("-");
    // Validate that we have all components
    if (year && month && day) {
      // Create date to check validity
      const date = new Date(+year, +month - 1, +day);
      // Check if the date is valid
      return date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;
    }
  } else {
    // Handle US date format (MM/DD/YYYY)
    const [month, day, year] = dateString.split("/");
    // Validate that we have all components
    if (month && day && year) {
      // Create date to check validity
      const date = new Date(+year, +month - 1, +day);
      // Check if the date is valid
      return date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;
    }
  }

  return false;
};

/**
 * Parse a local date string in either MM/DD/YYYY or YYYY-MM-DD format
 * @param {string} dateString - The date string to parse
 * @returns {Date} - The parsed Date object
 */
MagnateUtils.parseLocalDateString = function (dateString) {
  // Handle null or undefined input
  if (!dateString) {
    return new Date();
  }

  // Validate the date string first
  if (!MagnateUtils.isValidDateString(dateString)) {
    throw new Error('Invalid date string: ' + dateString);
  }

  // Check date format and parse accordingly
  if (dateString.includes("-")) {
    // Handle ISO date format (YYYY-MM-DD)
    const [year, month, day] = dateString.split("-");
    // Create date at start of day to avoid timezone issues
    const date = new Date(+year, +month - 1, +day);
    date.setHours(0, 0, 0, 0); // Set to start of day
    return date;
  } else {
    // Handle US date format (MM/DD/YYYY)
    const [month, day, year] = dateString.split("/");
    // Create date at start of day to avoid timezone issues
    const date = new Date(+year, +month - 1, +day);
    date.setHours(0, 0, 0, 0); // Set to start of day
    return date;
  }
};

/**
 * Get local date string in MM/DD/YYYY format
 * @param {Date} d - The date to format
 * @returns {string} - Formatted date string
 */
MagnateUtils.getLocalDateString = function (d) {
  // Create date without timezone modifications to ensure consistency
  const year = d.getFullYear();
  const month = MagnateUtils._padNumber(d.getMonth() + 1, 2);
  const day = MagnateUtils._padNumber(d.getDate(), 2);
  return `${month}/${day}/${year}`;
};

/**
 * Format ISO date string for display in prompts
 * @param {string} isoDateString - The ISO date string to format
 * @returns {string} - Formatted date string
 */
MagnateUtils.formatDateForPrompt = function (isoDateString) {
  // For ISO date strings (YYYY-MM-DD), we want to display them as MM/DD/YYYY
  if (isoDateString && isoDateString.includes("-")) {
    const [year, month, day] = isoDateString.split("-");
    return `${month}/${day}/${year}`;
  }
  return isoDateString;
};

/**
 * Prompt user for a date with validation
 * @param {string} message - The prompt message to display
 * @param {Date} defaultDate - The default date to use if user doesn't provide one
 * @returns {string|null} - The validated date string or null if cancelled
 */
MagnateUtils.promptDate = function (message, defaultDate) {
  defaultDate = defaultDate || new Date();
  // Use toLocaleDateString directly to avoid timezone adjustments
  let defaultString = defaultDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
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
};

/**
 * Convert MM/DD/YYYY format to YYYY-MM-DD format
 * @param {string} dateString - Date string in MM/DD/YYYY format
 * @returns {string} - Date string in YYYY-MM-DD format
 */
MagnateUtils.convertToISOFormat = function (dateString) {
  if (!dateString) return '';
  // Already in ISO format
  if (dateString.includes('-') && !dateString.includes('/')) {
    return dateString;
  }
  // Convert MM/DD/YYYY to YYYY-MM-DD
  if (dateString.includes('/')) {
    const [month, day, year] = dateString.split('/');
    return `${year}-${MagnateUtils._padNumber(parseInt(month), 2)}-${MagnateUtils._padNumber(parseInt(day), 2)}`;
  }
  return dateString;
};

/**
 * Convert YYYY-MM-DD format to MM/DD/YYYY format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Date string in MM/DD/YYYY format
 */
MagnateUtils.convertToUSFormat = function (dateString) {
  if (!dateString) return '';
  // Already in US format
  if (dateString.includes('/') && !dateString.includes('-')) {
    return dateString;
  }
  // Convert YYYY-MM-DD to MM/DD/YYYY
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    return `${MagnateUtils._padNumber(parseInt(month), 2)}/${MagnateUtils._padNumber(parseInt(day), 2)}/${year}`;
  }
  return dateString;
};

/**
 * Normalize date string for comparison (convert to YYYY-MM-DD)
 * @param {string} dateString - Date string in either format
 * @returns {string} - Normalized date string in YYYY-MM-DD format
 */
MagnateUtils.normalizeDateFormat = function (dateString) {
  if (!dateString) return '';

  // Handle both MM/DD/YYYY and YYYY-MM-DD formats
  if (dateString.includes('/')) {
    // Convert MM/DD/YYYY to YYYY-MM-DD for comparison
    const [month, day, year] = dateString.split('/');
    return `${year}-${MagnateUtils._padNumber(parseInt(month), 2)}-${MagnateUtils._padNumber(parseInt(day), 2)}`;
  } else if (dateString.includes('-')) {
    // Already in YYYY-MM-DD format, take just the date part
    return dateString.slice(0, 10);
  }

  return dateString;
};

/**
 * Compare two date strings regardless of format (MM/DD/YYYY or YYYY-MM-DD)
 * @param {string} date1 - First date string
 * @param {string} date2 - Second date string
 * @returns {boolean} - True if dates are equal
 */
MagnateUtils.compareDateStrings = function (date1, date2) {
  return MagnateUtils.normalizeDateFormat(date1) === MagnateUtils.normalizeDateFormat(date2);
};

/**
 * Check if a date string is between two other date strings
 * @param {string} date - Date to check
 * @param {string} startDate - Start date range
 * @param {string} endDate - End date range
 * @returns {boolean} - True if date is between start and end dates
 */
MagnateUtils.isDateBetween = function (date, startDate, endDate) {
  const normalizedDate = MagnateUtils.normalizeDateFormat(date);
  const normalizedStart = MagnateUtils.normalizeDateFormat(startDate);
  const normalizedEnd = MagnateUtils.normalizeDateFormat(endDate);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
};

/**
 * Convert date string to Date object
 * @param {string} dateString - Date string in MM/DD/YYYY or YYYY-MM-DD format
 * @returns {Date} - Date object
 */
MagnateUtils.dateStringToDateObject = function (dateString) {
  if (!dateString) return new Date();

  const normalized = MagnateUtils.normalizeDateFormat(dateString);
  const [year, month, day] = normalized.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};