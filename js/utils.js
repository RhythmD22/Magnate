(function () {
  'use strict';

  window.MagnateUtils = window.MagnateUtils || {};

  MagnateUtils.createListenerManager = function () {
    const listeners = [];
    return {
      add: function (element, event, handler, options) {
        if (element) {
          element.addEventListener(event, handler, options);
          listeners.push({ element, event, handler, options });
        }
      },
      cleanup: function () {
        listeners.forEach(function (l) {
          l.element.removeEventListener(l.event, l.handler, l.options);
        });
      },
      clearDetached: function () {
        for (let i = listeners.length - 1; i >= 0; i--) {
          if (!document.body.contains(listeners[i].element)) {
            listeners[i].element.removeEventListener(listeners[i].event, listeners[i].handler, listeners[i].options);
            listeners.splice(i, 1);
          }
        }
      }
    };
  };

  MagnateUtils._padNumber = function (num, size) {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  };

  MagnateUtils.formatNumber = function (num) {
    if (num == null || isNaN(num)) return '0';
    const numStr = num.toString();
    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedInteger + decimalPart;
  };

  MagnateUtils.getMonthKey = function (date) {
    return date.getFullYear() + '-' + MagnateUtils._padNumber(date.getMonth() + 1, 2);
  };

  MagnateUtils.getWeekDateRange = function (weekStart) {
    const startStr = MagnateUtils.getLocalDateString(weekStart);
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const endStr = MagnateUtils.getLocalDateString(weekEndDate);
    const normalizedStart = MagnateUtils.normalizeDateFormat(startStr);
    const normalizedEnd = MagnateUtils.normalizeDateFormat(endStr);
    return { startStr, endStr, normalizedStart, normalizedEnd };
  };

  MagnateUtils.promptNumber = async function (message) {
    return await MagnateUI.promptNumber(message);
  };

  MagnateUtils.getMonday = function (d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(date.setDate(diff));
  };

  MagnateUtils.generateId = function () {
    return Date.now() + Math.floor(Math.random() * 10000);
  };

  MagnateUtils.isValidDateString = function (dateString) {
    if (!dateString) return false;

    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-");
      if (year && month && day) {
        const date = new Date(+year, +month - 1, +day);
        return date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;
      }
    } else {
      const [month, day, year] = dateString.split("/");
      if (month && day && year) {
        const date = new Date(+year, +month - 1, +day);
        return date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;
      }
    }

    return false;
  };

  MagnateUtils.parseLocalDateString = function (dateString) {
    if (!dateString) return new Date();

    if (!MagnateUtils.isValidDateString(dateString)) {
      throw new Error('Invalid date string: ' + dateString);
    }

    const normalized = MagnateUtils.normalizeDateFormat(dateString);
    const [year, month, day] = normalized.split('-');
    const date = new Date(+year, +month - 1, +day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  MagnateUtils.getLocalDateString = function (d) {
    const year = d.getFullYear();
    const month = MagnateUtils._padNumber(d.getMonth() + 1, 2);
    const day = MagnateUtils._padNumber(d.getDate(), 2);
    return `${month}/${day}/${year}`;
  };

  MagnateUtils.formatDateForPrompt = function (isoDateString) {
    if (isoDateString && isoDateString.includes("-")) {
      const [year, month, day] = isoDateString.split("-");
      return `${month}/${day}/${year}`;
    }
    return isoDateString;
  };

  MagnateUtils.promptDate = async function (message, defaultDate) {
    defaultDate = defaultDate || new Date();
    let defaultString = defaultDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const fullMessage = message + " (MM/DD/YYYY, blank = " + defaultString + ")";
    const result = await MagnateUI.promptDate(fullMessage, defaultString);
    if (result === null) return null;
    return result === '' ? defaultString : result;
  };

  MagnateUtils.convertToISOFormat = function (dateString) {
    if (!dateString) return '';
    if (dateString.includes('-') && !dateString.includes('/')) return dateString;
    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/');
      return `${year}-${MagnateUtils._padNumber(parseInt(month), 2)}-${MagnateUtils._padNumber(parseInt(day), 2)}`;
    }
    return dateString;
  };

  MagnateUtils.convertToUSFormat = function (dateString) {
    if (!dateString) return '';
    if (dateString.includes('/') && !dateString.includes('-')) return dateString;
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${MagnateUtils._padNumber(parseInt(month), 2)}/${MagnateUtils._padNumber(parseInt(day), 2)}/${year}`;
    }
    return dateString;
  };

  MagnateUtils.normalizeDateFormat = function (dateString) {
    if (!dateString) return '';

    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/');
      return `${year}-${MagnateUtils._padNumber(parseInt(month), 2)}-${MagnateUtils._padNumber(parseInt(day), 2)}`;
    } else if (dateString.includes('-')) {
      return dateString.slice(0, 10);
    }

    return dateString;
  };

  MagnateUtils.compareDateStrings = function (date1, date2) {
    return MagnateUtils.normalizeDateFormat(date1) === MagnateUtils.normalizeDateFormat(date2);
  };

  MagnateUtils.isDateBetween = function (date, startDate, endDate) {
    const normalizedDate = MagnateUtils.normalizeDateFormat(date);
    const normalizedStart = MagnateUtils.normalizeDateFormat(startDate);
    const normalizedEnd = MagnateUtils.normalizeDateFormat(endDate);

    return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
  };

  MagnateUtils.dateStringToDateObject = function (dateString) {
    if (!dateString) return new Date();

    const normalized = MagnateUtils.normalizeDateFormat(dateString);
    const [year, month, day] = normalized.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  MagnateUtils.SVG_EDIT_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" style="display: block; margin: auto; position: relative; top: 2px; left: 3px;">
  <path d="M2.66795 14.6297L13.3222 3.98517L11.6133 2.26642L0.949202 12.911L0.021468 15.0887C-0.0761882 15.3231 0.177718 15.5965 0.412093 15.4988ZM14.1816 3.14533L15.168 2.17853C15.666 1.68048 15.6953 1.14338 15.2461 0.694157L14.914 0.362125C14.4746-0.0773278 13.9375-0.0382653 13.4394 0.450016L12.4531 1.42658Z" fill="white" fill-opacity="0.85"/>
</svg>`;

  MagnateUtils.SVG_DELETE_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" style="position: relative; left: 1.5px; top: 0px;">
  <path d="M6.5625 18.6035C6.93359 18.6035 7.17773 18.3691 7.16797 18.0273L6.86523 7.57812C6.85547 7.23633 6.61133 7.01172 6.25977 7.01172C5.88867 7.01172 5.64453 7.24609 5.6543 7.58789L5.94727 18.0273C5.95703 18.3789 6.20117 18.6035 6.5625 18.6035ZM9.45312 18.6035C9.82422 18.6035 10.0879 18.3691 10.0879 18.0273L10.0879 7.58789C10.0879 7.24609 9.82422 7.01172 9.45312 7.01172C9.08203 7.01172 8.82812 7.24609 8.82812 7.58789L8.82812 18.0273C8.82812 18.3691 9.08203 18.6035 9.45312 18.6035ZM12.3535 18.6035C12.7051 18.6035 12.9492 18.3789 12.959 18.0273L13.252 7.58789C13.2617 7.24609 13.0176 7.01172 12.6465 7.01172C12.2949 7.01172 12.0508 7.23633 12.041 7.58789L11.748 18.0273C11.7383 18.3691 11.9824 18.6035 12.3535 18.6035ZM5.16602 4.46289L6.71875 4.46289L6.71875 2.37305C6.71875 1.81641 7.10938 1.45508 7.69531 1.45508L11.1914 1.45508C11.7773 1.45508 12.168 1.81641 12.168 2.37305L12.168 4.46289L13.7207 4.46289L13.7207 2.27539C13.7207 0.859375 12.8027 0 11.2988 0L7.58789 0C6.08398 0 5.16602 0.859375 5.16602 2.27539ZM0.732422 5.24414L18.1836 5.24414C18.584 5.24414 18.9062 4.90234 18.9062 4.50195C18.9062 4.10156 18.584 3.76953 18.1836 3.76953L0.732422 3.76953C0.341797 3.76953 0 4.10156 0 4.50195C0 4.91211 0.341797 5.24414 0.732422 5.24414ZM4.98047 21.748L13.9355 21.748C15.332 21.748 16.2695 20.8398 16.3379 19.4434L17.0215 5.05859L15.4492 5.05859L14.7949 19.2773C14.7754 19.8633 14.3555 20.2734 13.7793 20.2734L5.11719 20.2734C4.56055 20.2734 4.14062 19.8535 4.11133 19.2773L3.41797 5.05859L1.88477 5.05859L2.57812 19.4531C2.64648 20.8496 3.56445 21.748 4.98047 21.748Z" fill="white" fill-opacity="0.85"/>
</svg>`;
})();