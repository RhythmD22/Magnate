import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupGlobals, loadUtils, resetAll } from './helpers.js';

setupGlobals();

let MagnateUtils;

beforeEach(() => {
  resetAll();
  MagnateUtils = loadUtils();
});

describe('_padNumber', () => {
  it('pads single-digit numbers to specified length', () => {
    assert.strictEqual(MagnateUtils._padNumber(5, 2), '05');
    assert.strictEqual(MagnateUtils._padNumber(5, 3), '005');
  });

  it('does not pad numbers that already meet the size', () => {
    assert.strictEqual(MagnateUtils._padNumber(12, 2), '12');
    assert.strictEqual(MagnateUtils._padNumber(100, 3), '100');
  });
});

describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    assert.strictEqual(MagnateUtils.formatNumber(1000), '1,000');
    assert.strictEqual(MagnateUtils.formatNumber(1000000), '1,000,000');
    assert.strictEqual(MagnateUtils.formatNumber(1234567), '1,234,567');
  });

  it('handles decimal numbers', () => {
    assert.strictEqual(MagnateUtils.formatNumber(1234.56), '1,234.56');
    assert.strictEqual(MagnateUtils.formatNumber(0.99), '0.99');
  });

  it('handles negative numbers', () => {
    assert.strictEqual(MagnateUtils.formatNumber(-1000), '-1,000');
    assert.strictEqual(MagnateUtils.formatNumber(-1234.56), '-1,234.56');
  });

  it('returns "0" for null, undefined, or NaN', () => {
    assert.strictEqual(MagnateUtils.formatNumber(null), '0');
    assert.strictEqual(MagnateUtils.formatNumber(undefined), '0');
    assert.strictEqual(MagnateUtils.formatNumber(NaN), '0');
  });

  it('handles zero', () => {
    assert.strictEqual(MagnateUtils.formatNumber(0), '0');
  });
});

describe('getMonthKey', () => {
  it('returns YYYY-MM format', () => {
    const date = new Date(2024, 0, 15);
    assert.strictEqual(MagnateUtils.getMonthKey(date), '2024-01');
  });

  it('handles December correctly', () => {
    const date = new Date(2024, 11, 25);
    assert.strictEqual(MagnateUtils.getMonthKey(date), '2024-12');
  });
});

describe('generateId', () => {
  it('generates a numeric ID', () => {
    const id = MagnateUtils.generateId();
    assert.strictEqual(typeof id, 'number');
    assert.ok(id > 0);
  });

  it('generates unique IDs', () => {
    const id1 = MagnateUtils.generateId();
    const id2 = MagnateUtils.generateId();
    assert.notStrictEqual(id1, id2);
  });
});

describe('getMonday', () => {
  it('returns Monday for a given date', () => {
    const wednesday = new Date(2024, 0, 10);
    const monday = MagnateUtils.getMonday(wednesday);
    assert.strictEqual(monday.getDay(), 1);
    assert.strictEqual(monday.getDate(), 8);
  });

  it('returns same date if already Monday', () => {
    const monday = new Date(2024, 0, 8);
    const result = MagnateUtils.getMonday(monday);
    assert.strictEqual(result.getDay(), 1);
    assert.strictEqual(result.getDate(), 8);
  });

  it('handles Sunday correctly', () => {
    const sunday = new Date(2024, 0, 14);
    const monday = MagnateUtils.getMonday(sunday);
    assert.strictEqual(monday.getDay(), 1);
    assert.strictEqual(monday.getDate(), 8);
  });
});

describe('isValidDateString', () => {
  it('validates ISO-style date strings', () => {
    assert.ok(MagnateUtils.isValidDateString('2024-01-15'));
    assert.ok(MagnateUtils.isValidDateString('2024-12-31'));
  });

  it('validates US-style date strings', () => {
    assert.ok(MagnateUtils.isValidDateString('01/15/2024'));
    assert.ok(MagnateUtils.isValidDateString('12/31/2024'));
    assert.ok(MagnateUtils.isValidDateString('1/5/2024'));
  });

  it('rejects invalid dates', () => {
    assert.strictEqual(MagnateUtils.isValidDateString('2024-13-01'), false);
    assert.strictEqual(MagnateUtils.isValidDateString('2024-02-30'), false);
    assert.strictEqual(MagnateUtils.isValidDateString('13/01/2024'), false);
  });

  it('rejects empty or falsy values', () => {
    assert.strictEqual(MagnateUtils.isValidDateString(''), false);
    assert.strictEqual(MagnateUtils.isValidDateString(null), false);
    assert.strictEqual(MagnateUtils.isValidDateString(undefined), false);
  });

  it('rejects non-date strings', () => {
    assert.strictEqual(MagnateUtils.isValidDateString('hello'), false);
    assert.strictEqual(MagnateUtils.isValidDateString('12345'), false);
  });
});

describe('normalizeDateFormat', () => {
  it('converts US format to ISO format', () => {
    assert.strictEqual(MagnateUtils.normalizeDateFormat('01/15/2024'), '2024-01-15');
    assert.strictEqual(MagnateUtils.normalizeDateFormat('12/31/2024'), '2024-12-31');
  });

  it('preserves ISO format', () => {
    assert.strictEqual(MagnateUtils.normalizeDateFormat('2024-01-15'), '2024-01-15');
    assert.strictEqual(MagnateUtils.normalizeDateFormat('2024-12-31T12:00:00Z'), '2024-12-31');
  });

  it('returns empty string for falsy input', () => {
    assert.strictEqual(MagnateUtils.normalizeDateFormat(''), '');
    assert.strictEqual(MagnateUtils.normalizeDateFormat(null), '');
  });
});

describe('convertToISOFormat', () => {
  it('converts US format to ISO', () => {
    assert.strictEqual(MagnateUtils.convertToISOFormat('01/15/2024'), '2024-01-15');
    assert.strictEqual(MagnateUtils.convertToISOFormat('12/31/2024'), '2024-12-31');
  });

  it('preserves ISO format', () => {
    assert.strictEqual(MagnateUtils.convertToISOFormat('2024-01-15'), '2024-01-15');
  });

  it('returns empty for falsy', () => {
    assert.strictEqual(MagnateUtils.convertToISOFormat(''), '');
    assert.strictEqual(MagnateUtils.convertToISOFormat(null), '');
  });
});

describe('convertToUSFormat', () => {
  it('converts ISO format to US format', () => {
    assert.strictEqual(MagnateUtils.convertToUSFormat('2024-01-15'), '01/15/2024');
    assert.strictEqual(MagnateUtils.convertToUSFormat('2024-12-31'), '12/31/2024');
  });

  it('preserves US format', () => {
    assert.strictEqual(MagnateUtils.convertToUSFormat('01/15/2024'), '01/15/2024');
  });

  it('returns empty for falsy', () => {
    assert.strictEqual(MagnateUtils.convertToUSFormat(''), '');
    assert.strictEqual(MagnateUtils.convertToUSFormat(null), '');
  });
});

describe('compareDateStrings', () => {
  it('returns true for equal dates in different formats', () => {
    assert.ok(MagnateUtils.compareDateStrings('01/15/2024', '2024-01-15'));
  });

  it('returns false for different dates', () => {
    assert.strictEqual(MagnateUtils.compareDateStrings('01/15/2024', '2024-01-16'), false);
  });
});

describe('isDateBetween', () => {
  it('returns true when date is within range', () => {
    assert.ok(MagnateUtils.isDateBetween('01/15/2024', '2024-01-01', '2024-01-31'));
    assert.ok(MagnateUtils.isDateBetween('2024-01-15', '01/01/2024', '01/31/2024'));
  });

  it('returns true when date equals start or end', () => {
    assert.ok(MagnateUtils.isDateBetween('01/01/2024', '2024-01-01', '2024-01-31'));
    assert.ok(MagnateUtils.isDateBetween('01/31/2024', '2024-01-01', '2024-01-31'));
  });

  it('returns false when date is outside range', () => {
    assert.strictEqual(MagnateUtils.isDateBetween('12/31/2023', '2024-01-01', '2024-01-31'), false);
    assert.strictEqual(MagnateUtils.isDateBetween('02/01/2024', '2024-01-01', '2024-01-31'), false);
  });
});

describe('dateStringToDateObject', () => {
  it('parses ISO format to Date', () => {
    const result = MagnateUtils.dateStringToDateObject('2024-01-15');
    assert.ok(result instanceof Date);
    assert.strictEqual(result.getFullYear(), 2024);
    assert.strictEqual(result.getMonth(), 0);
    assert.strictEqual(result.getDate(), 15);
  });

  it('parses US format to Date', () => {
    const result = MagnateUtils.dateStringToDateObject('01/15/2024');
    assert.ok(result instanceof Date);
    assert.strictEqual(result.getFullYear(), 2024);
    assert.strictEqual(result.getMonth(), 0);
    assert.strictEqual(result.getDate(), 15);
  });

  it('returns current date for falsy input', () => {
    const result = MagnateUtils.dateStringToDateObject('');
    assert.ok(result instanceof Date);
    assert.strictEqual(result.getFullYear(), new Date().getFullYear());
  });
});

describe('getLocalDateString', () => {
  it('formats date as MM/DD/YYYY', () => {
    const date = new Date(2024, 0, 15);
    assert.strictEqual(MagnateUtils.getLocalDateString(date), '01/15/2024');
  });

  it('pads single-digit month and day', () => {
    const date = new Date(2024, 0, 5);
    assert.strictEqual(MagnateUtils.getLocalDateString(date), '01/05/2024');
  });
});

describe('formatDateForPrompt', () => {
  it('converts ISO to US format for display', () => {
    assert.strictEqual(MagnateUtils.formatDateForPrompt('2024-01-15'), '01/15/2024');
  });

  it('returns input unchanged if not in ISO format', () => {
    assert.strictEqual(MagnateUtils.formatDateForPrompt('01/15/2024'), '01/15/2024');
  });

  it('handles falsy input', () => {
    assert.strictEqual(MagnateUtils.formatDateForPrompt(null), null);
    assert.strictEqual(MagnateUtils.formatDateForPrompt(''), '');
  });
});

describe('parseLocalDateString', () => {
  it('parses a valid US date string', () => {
    const result = MagnateUtils.parseLocalDateString('01/15/2024');
    assert.ok(result instanceof Date);
    assert.strictEqual(result.getFullYear(), 2024);
    assert.strictEqual(result.getMonth(), 0);
    assert.strictEqual(result.getDate(), 15);
    assert.strictEqual(result.getHours(), 0);
    assert.strictEqual(result.getMinutes(), 0);
  });

  it('throws on invalid date string', () => {
    assert.throws(() => MagnateUtils.parseLocalDateString('13/01/2024'), /Invalid date string/);
  });

  it('returns current date for falsy input', () => {
    const result = MagnateUtils.parseLocalDateString('');
    assert.ok(result instanceof Date);
  });
});

describe('getWeekDateRange', () => {
  it('returns correct week range for a Monday', () => {
    const monday = new Date(2024, 0, 8);
    monday.setHours(0, 0, 0, 0);
    const range = MagnateUtils.getWeekDateRange(monday);
    assert.strictEqual(range.startStr, '01/08/2024');
    assert.strictEqual(range.endStr, '01/14/2024');
    assert.strictEqual(range.normalizedStart, '2024-01-08');
    assert.strictEqual(range.normalizedEnd, '2024-01-14');
  });
});

describe('createListenerManager', () => {
  it('creates a manager with add and cleanup methods', () => {
    const manager = MagnateUtils.createListenerManager();
    assert.strictEqual(typeof manager.add, 'function');
    assert.strictEqual(typeof manager.cleanup, 'function');
    assert.strictEqual(typeof manager.clearDetached, 'function');
  });
});