import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupGlobals, loadDataManager, clearStore, resetAll, getStore } from './helpers.js';

setupGlobals();

let MagnateData, MagnateUtils;

beforeEach(() => {
  resetAll();
  MagnateData = loadDataManager();
  MagnateUtils = globalThis.MagnateUtils;
});

describe('loadData', () => {
  it('loads default categories when no data exists', () => {
    MagnateData.categories = [];
    MagnateData.loadData();
    assert.ok(MagnateData.categories.length > 0);
    assert.strictEqual(MagnateData.categories[0].name, 'Entertainment');
  });

  it('loads default goals when no data exists', () => {
    MagnateData.goals = [];
    MagnateData.loadData();
    assert.ok(MagnateData.goals.length > 0);
    assert.strictEqual(MagnateData.goals[0].title, 'Emergency Fund');
  });

  it('sets sanitized flag on goals that lack it', () => {
    const store = getStore();
    const goalsWithoutSanitized = [
      { id: 1, title: 'Test Goal', description: 'A goal', current: 100, target: 500 },
    ];
    store.goals = JSON.stringify(goalsWithoutSanitized);
    MagnateData.loadData();
    assert.ok(MagnateData.goals.length > 0);
    MagnateData.goals.forEach(goal => {
      assert.strictEqual(goal.sanitized, true);
    });
  });

  it('preserves existing categories from localStorage', () => {
    const store = getStore();
    store.categories = JSON.stringify([{ id: 99, name: 'Custom', budget: 50 }]);
    MagnateData.loadData();
    assert.strictEqual(MagnateData.categories.length, 1);
    assert.strictEqual(MagnateData.categories[0].name, 'Custom');
  });

  it('initializes currentWeekStart to a valid date', () => {
    MagnateData.loadData();
    assert.ok(MagnateData.currentWeekStart instanceof Date);
    assert.ok(!isNaN(MagnateData.currentWeekStart.getTime()));
  });

  it('loads currentWeekStart from localStorage when available', () => {
    const store = getStore();
    store.currentWeekStart = '2024-01-15T12:00:00.000Z';
    MagnateData.loadData();
    assert.ok(MagnateData.currentWeekStart instanceof Date);
    assert.ok(!isNaN(MagnateData.currentWeekStart.getTime()));
    assert.strictEqual(MagnateData.currentWeekStart.getUTCFullYear(), 2024);
  });

  it('handles corrupted localStorage gracefully', () => {
    const store = getStore();
    store.expenses = 'not valid json {{{';
    MagnateData.loadData();
    assert.deepStrictEqual(MagnateData.expenses, []);
  });

  it('loads expenses and incomes from localStorage', () => {
    const store = getStore();
    store.expenses = JSON.stringify([{ id: 1, date: '2024-01-15', title: 'Coffee', amount: -5, category: 'Food' }]);
    store.incomes = JSON.stringify([{ id: 2, date: '2024-01-14', title: 'Salary', amount: 5000, category: 'Work' }]);
    MagnateData.loadData();
    assert.strictEqual(MagnateData.expenses.length, 1);
    assert.strictEqual(MagnateData.expenses[0].title, 'Coffee');
    assert.strictEqual(MagnateData.incomes.length, 1);
    assert.strictEqual(MagnateData.incomes[0].title, 'Salary');
  });
});

describe('saveData', () => {
  it('persists data to localStorage', () => {
    MagnateData.loadData();
    MagnateData.expenses = [{ id: 1, date: '2024-01-15', title: 'Test', amount: -10, category: 'Test' }];
    MagnateData.saveData();
    const store = getStore();
    const saved = JSON.parse(store.expenses);
    assert.strictEqual(saved.length, 1);
    assert.strictEqual(saved[0].title, 'Test');
  });

  it('persists currentWeekStart', () => {
    MagnateData.loadData();
    MagnateData.currentWeekStart = new Date('2024-06-03T00:00:00.000Z');
    MagnateData.saveData();
    const store = getStore();
    assert.ok(store.currentWeekStart);
  });
});

describe('_validateData', () => {
  it('resets non-array fields to arrays', () => {
    MagnateData.expenses = 'not an array';
    MagnateData.incomes = 123;
    MagnateData._validateData();
    assert.ok(Array.isArray(MagnateData.expenses));
    assert.ok(Array.isArray(MagnateData.incomes));
  });

  it('resets non-object monthlyBudgets', () => {
    MagnateData.monthlyBudgets = 'not an object';
    MagnateData._validateData();
    assert.deepStrictEqual(MagnateData.monthlyBudgets, {});
  });

  it('resets non-object categoryBudgets', () => {
    MagnateData.categoryBudgets = null;
    MagnateData._validateData();
    assert.deepStrictEqual(MagnateData.categoryBudgets, {});
  });

  it('resets non-string notes', () => {
    MagnateData.notes = 12345;
    MagnateData._validateData();
    assert.strictEqual(MagnateData.notes, '');
  });
});

describe('getCategoryByName', () => {
  it('finds a category by name case-insensitively', () => {
    MagnateData.loadData();
    const cat = MagnateData.getCategoryByName('entertainment');
    assert.ok(cat);
    assert.strictEqual(cat.name, 'Entertainment');
  });

  it('returns null for non-existent category', () => {
    MagnateData.loadData();
    assert.strictEqual(MagnateData.getCategoryByName('NonExistent'), null);
  });

  it('returns null for falsy input', () => {
    MagnateData.loadData();
    assert.strictEqual(MagnateData.getCategoryByName(''), null);
    assert.strictEqual(MagnateData.getCategoryByName(null), null);
  });
});

describe('_filterTransactionsByDate', () => {
  it('filters transactions within a date range', () => {
    const transactions = [
      { id: 1, date: '01/15/2024', title: 'Mid', amount: -50, category: 'Food' },
      { id: 2, date: '01/01/2024', title: 'Start', amount: -30, category: 'Food' },
      { id: 3, date: '01/31/2024', title: 'End', amount: -20, category: 'Food' },
    ];
    const start = MagnateUtils.normalizeDateFormat('01/10/2024');
    const end = MagnateUtils.normalizeDateFormat('01/20/2024');
    const filtered = MagnateData._filterTransactionsByDate(transactions, start, end);
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].title, 'Mid');
  });

  it('handles ISO date formats', () => {
    const transactions = [
      { id: 1, date: '2024-01-15', title: 'Iso', amount: -50, category: 'Food' },
    ];
    const start = MagnateUtils.normalizeDateFormat('01/01/2024');
    const end = MagnateUtils.normalizeDateFormat('01/31/2024');
    const filtered = MagnateData._filterTransactionsByDate(transactions, start, end);
    assert.strictEqual(filtered.length, 1);
  });

  it('skips transactions with invalid dates', () => {
    const transactions = [
      { id: 1, date: 'invalid', title: 'Bad', amount: -50, category: 'Food' },
      { id: 2, date: '01/15/2024', title: 'Good', amount: -30, category: 'Food' },
    ];
    const start = MagnateUtils.normalizeDateFormat('01/01/2024');
    const end = MagnateUtils.normalizeDateFormat('01/31/2024');
    const filtered = MagnateData._filterTransactionsByDate(transactions, start, end);
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].title, 'Good');
  });
});

describe('getTransactionGroups', () => {
  it('groups transactions by category', () => {
    MagnateData.loadData();
    const weekStart = new Date('2024-01-08T00:00:00.000Z');
    MagnateData.currentWeekStart = weekStart;

    MagnateData.expenses = [
      { id: 1, date: '01/10/2024', title: 'Coffee', amount: -5, category: 'Food' },
      { id: 2, date: '01/11/2024', title: 'Movie', amount: -15, category: 'Entertainment' },
    ];
    MagnateData.incomes = [
      { id: 3, date: '01/12/2024', title: 'Gig', amount: 100, category: 'Work' },
    ];

    const groups = MagnateData.getTransactionGroups(weekStart);
    assert.ok(groups.length >= 1);
    const categories = groups.map(g => g.category);
    assert.ok(categories.includes('Food'));
    assert.ok(categories.includes('Entertainment'));
    assert.ok(categories.includes('Work'));
  });

  it('calculates correct totals per category', () => {
    MagnateData.loadData();
    const weekStart = new Date('2024-01-08T00:00:00.000Z');
    MagnateData.currentWeekStart = weekStart;

    MagnateData.expenses = [
      { id: 1, date: '01/10/2024', title: 'A', amount: -10, category: 'Food' },
      { id: 2, date: '01/11/2024', title: 'B', amount: -20, category: 'Food' },
    ];
    MagnateData.incomes = [];

    const groups = MagnateData.getTransactionGroups(weekStart);
    const foodGroup = groups.find(g => g.category === 'Food');
    assert.ok(foodGroup);
    assert.strictEqual(foodGroup.total, -30);
  });

  it('uses currentWeekStart when no argument passed', () => {
    MagnateData.loadData();
    const weekStart = new Date('2024-01-08T00:00:00.000Z');
    MagnateData.currentWeekStart = weekStart;

    MagnateData.expenses = [
      { id: 1, date: '01/10/2024', title: 'Test', amount: -5, category: 'Test' },
    ];
    MagnateData.incomes = [];

    const groups = MagnateData.getTransactionGroups();
    assert.ok(groups.length >= 1);
  });
});