import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupGlobals, loadCSVHandler, clearStore, resetAll } from './helpers.js';

setupGlobals();

let MagnateCSV, MagnateData, MagnateUtils;

beforeEach(() => {
  resetAll();
  MagnateCSV = loadCSVHandler();
  MagnateData = globalThis.MagnateData;
  MagnateUtils = globalThis.MagnateUtils;
});

describe('_isValidMonthFormat', () => {
  it('validates correct month format', () => {
    assert.ok(MagnateCSV._isValidMonthFormat('2024-01'));
    assert.ok(MagnateCSV._isValidMonthFormat('2024-12'));
  });

  it('rejects invalid formats', () => {
    assert.strictEqual(MagnateCSV._isValidMonthFormat('2024-1'), false);
    assert.strictEqual(MagnateCSV._isValidMonthFormat('01/2024'), false);
    assert.strictEqual(MagnateCSV._isValidMonthFormat('not-a-date'), false);
    assert.strictEqual(MagnateCSV._isValidMonthFormat(''), false);
  });
});

describe('_isValidNumber', () => {
  it('accepts valid numbers', () => {
    assert.ok(MagnateCSV._isValidNumber('100'));
    assert.ok(MagnateCSV._isValidNumber('-50.25'));
    assert.ok(MagnateCSV._isValidNumber('0'));
  });

  it('rejects non-numbers', () => {
    assert.strictEqual(MagnateCSV._isValidNumber('abc'), false);
    assert.strictEqual(MagnateCSV._isValidNumber(''), false);
  });
});

describe('_escapeCSVField', () => {
  it('returns string as-is when no escaping needed', () => {
    assert.strictEqual(MagnateCSV._escapeCSVField('hello'), 'hello');
    assert.strictEqual(MagnateCSV._escapeCSVField('123'), '123');
  });

  it('wraps fields with commas in quotes', () => {
    assert.strictEqual(MagnateCSV._escapeCSVField('hello, world'), '"hello, world"');
  });

  it('escapes double-quotes inside fields', () => {
    assert.strictEqual(MagnateCSV._escapeCSVField('say "hi"'), '"say ""hi"""');
  });

  it('wraps fields with newlines in quotes', () => {
    assert.strictEqual(MagnateCSV._escapeCSVField('line1\nline2'), '"line1\nline2"');
  });

  it('handles null and undefined', () => {
    assert.strictEqual(MagnateCSV._escapeCSVField(null), '');
    assert.strictEqual(MagnateCSV._escapeCSVField(undefined), '');
  });
});

describe('_parseCSVLine', () => {
  it('splits a simple CSV line', () => {
    const result = MagnateCSV._parseCSVLine('a,b,c');
    assert.deepStrictEqual(result, ['a', 'b', 'c']);
  });

  it('handles quoted fields with commas inside', () => {
    const result = MagnateCSV._parseCSVLine('"hello, world",b,c');
    assert.deepStrictEqual(result, ['hello, world', 'b', 'c']);
  });

  it('handles escaped double-quotes', () => {
    const result = MagnateCSV._parseCSVLine('"say ""hi""",b');
    assert.deepStrictEqual(result, ['say "hi"', 'b']);
  });

  it('handles empty fields', () => {
    const result = MagnateCSV._parseCSVLine('a,,c');
    assert.deepStrictEqual(result, ['a', '', 'c']);
  });

  it('handles single field', () => {
    const result = MagnateCSV._parseCSVLine('onlyone');
    assert.deepStrictEqual(result, ['onlyone']);
  });
});

describe('_detectSection', () => {
  it('detects transactions section', () => {
    assert.strictEqual(MagnateCSV._detectSection('Date,Type,Title,Amount,Category'), 'transactions');
  });

  it('detects monthly budgets section', () => {
    assert.strictEqual(MagnateCSV._detectSection('Month,Total Budget'), 'monthlyBudgets');
  });

  it('detects categories section', () => {
    assert.strictEqual(MagnateCSV._detectSection('Category,Default Budget'), 'categories');
  });

  it('detects category budgets section', () => {
    assert.strictEqual(MagnateCSV._detectSection('Month,Category,Monthly Budget'), 'categoryBudgets');
  });

  it('detects goals section', () => {
    assert.strictEqual(MagnateCSV._detectSection('Goal ID,Title,Description,Current,Target'), 'goals');
  });

  it('detects calculator history section', () => {
    assert.strictEqual(MagnateCSV._detectSection('Calculation,Timestamp'), 'calculatorHistory');
  });

  it('detects notes section', () => {
    assert.strictEqual(MagnateCSV._detectSection('Notes'), 'notes');
  });

  it('detects metadata section', () => {
    assert.strictEqual(MagnateCSV._detectSection('Current Week Start,2024-01-01'), 'metadata');
  });

  it('returns null for unknown headers', () => {
    assert.strictEqual(MagnateCSV._detectSection('Unknown,Header,Line'), null);
  });
});

describe('_parseTransactionLine', () => {
  it('parses a valid expense line', () => {
    const expenses = [];
    const incomes = [];
    MagnateCSV._parseTransactionLine(['2024-01-15', 'Expense', 'Coffee', '-5', 'Food'], expenses, incomes);
    assert.strictEqual(expenses.length, 1);
    assert.strictEqual(expenses[0].title, 'Coffee');
    assert.strictEqual(expenses[0].amount, -5);
    assert.strictEqual(expenses[0].category, 'Food');
    assert.ok(expenses[0].id);
    assert.strictEqual(incomes.length, 0);
  });

  it('parses a valid income line', () => {
    const expenses = [];
    const incomes = [];
    MagnateCSV._parseTransactionLine(['2024-01-15', 'Income', 'Salary', '5000', 'Work'], expenses, incomes);
    assert.strictEqual(incomes.length, 1);
    assert.strictEqual(incomes[0].title, 'Salary');
    assert.strictEqual(incomes[0].amount, 5000);
    assert.strictEqual(expenses.length, 0);
  });

  it('maps Uncategorized category to empty string', () => {
    const expenses = [];
    MagnateCSV._parseTransactionLine(['2024-01-15', 'Expense', 'Coffee', '-5', 'Uncategorized'], expenses, []);
    assert.strictEqual(expenses[0].category, '');
  });

  it('skips lines with invalid date', () => {
    const expenses = [];
    MagnateCSV._parseTransactionLine(['invalid', 'Expense', 'Coffee', '-5', 'Food'], expenses, []);
    assert.strictEqual(expenses.length, 0);
  });

  it('skips lines with invalid amount', () => {
    const expenses = [];
    MagnateCSV._parseTransactionLine(['2024-01-15', 'Expense', 'Coffee', 'abc', 'Food'], expenses, []);
    assert.strictEqual(expenses.length, 0);
  });

  it('skips lines with too few values', () => {
    const expenses = [];
    MagnateCSV._parseTransactionLine(['2024-01-15'], expenses, []);
    assert.strictEqual(expenses.length, 0);
  });

  it('skips lines with invalid transaction type', () => {
    const expenses = [];
    const incomes = [];
    MagnateCSV._parseTransactionLine(['2024-01-15', 'Invalid', 'Title', '100', 'Cat'], expenses, incomes);
    assert.strictEqual(expenses.length, 0);
    assert.strictEqual(incomes.length, 0);
  });
});

describe('_parseMonthlyBudgetLine', () => {
  it('parses a valid monthly budget', () => {
    const budgets = {};
    MagnateCSV._parseMonthlyBudgetLine(['2024-01', '500'], budgets);
    assert.strictEqual(budgets['2024-01'], 500);
  });

  it('skips invalid month format', () => {
    const budgets = {};
    MagnateCSV._parseMonthlyBudgetLine(['bad', '500'], budgets);
    assert.deepStrictEqual(budgets, {});
  });

  it('skips invalid budget amount', () => {
    const budgets = {};
    MagnateCSV._parseMonthlyBudgetLine(['2024-01', 'abc'], budgets);
    assert.deepStrictEqual(budgets, {});
  });

  it('skips lines with too few values', () => {
    const budgets = {};
    MagnateCSV._parseMonthlyBudgetLine(['2024-01'], budgets);
    assert.deepStrictEqual(budgets, {});
  });
});

describe('_parseCategoryLine', () => {
  it('adds a new category', () => {
    const categories = [];
    const categoryMap = new Map();
    MagnateCSV._parseCategoryLine(['Food', '300'], categories, categoryMap);
    assert.strictEqual(categories.length, 1);
    assert.strictEqual(categories[0].name, 'Food');
    assert.strictEqual(categories[0].budget, 300);
    assert.ok(categories[0].id);
  });

  it('updates existing category budget', () => {
    const categories = [{ id: 1, name: 'Food', budget: 200 }];
    const categoryMap = new Map([['Food', categories[0]]]);
    MagnateCSV._parseCategoryLine(['Food', '350'], categories, categoryMap);
    assert.strictEqual(categories.length, 1);
    assert.strictEqual(categories[0].budget, 350);
  });

  it('skips invalid budget', () => {
    const categories = [];
    const categoryMap = new Map();
    MagnateCSV._parseCategoryLine(['Food', 'abc'], categories, categoryMap);
    assert.strictEqual(categories.length, 0);
  });

  it('skips lines with too few values', () => {
    const categories = [];
    const categoryMap = new Map();
    MagnateCSV._parseCategoryLine(['Food'], categories, categoryMap);
    assert.strictEqual(categories.length, 0);
  });
});

describe('_parseCategoryBudgetLine', () => {
  it('adds a category budget entry', () => {
    const categoryBudgets = {};
    const categories = [{ id: 1, name: 'Food', budget: 0 }];
    const categoryMap = new Map([['Food', categories[0]]]);
    MagnateCSV._parseCategoryBudgetLine(['2024-01', 'Food', '300'], categoryBudgets, categories, categoryMap);
    assert.ok(categoryBudgets['2024-01']);
    assert.strictEqual(categoryBudgets['2024-01']['1'], 300);
  });

  it('creates a new category if not found', () => {
    const categoryBudgets = {};
    const categories = [];
    const categoryMap = new Map();
    MagnateCSV._parseCategoryBudgetLine(['2024-01', 'NewCat', '200'], categoryBudgets, categories, categoryMap);
    assert.strictEqual(categories.length, 1);
    assert.strictEqual(categories[0].name, 'NewCat');
    assert.ok(categoryBudgets['2024-01']);
  });

  it('skips invalid month format', () => {
    const categoryBudgets = {};
    const categories = [];
    const categoryMap = new Map();
    MagnateCSV._parseCategoryBudgetLine(['invalid', 'Food', '300'], categoryBudgets, categories, categoryMap);
    assert.deepStrictEqual(categoryBudgets, {});
  });

  it('skips invalid budget amount', () => {
    const categoryBudgets = {};
    const categories = [];
    const categoryMap = new Map();
    MagnateCSV._parseCategoryBudgetLine(['2024-01', 'Food', 'abc'], categoryBudgets, categories, categoryMap);
    assert.deepStrictEqual(categoryBudgets, {});
  });
});

describe('_parseGoalLine', () => {
  it('parses a valid goal line', () => {
    const goals = [];
    MagnateCSV._parseGoalLine(['1', 'Emergency Fund', 'Save money', '450', '1000'], goals);
    assert.strictEqual(goals.length, 1);
    assert.strictEqual(goals[0].title, 'Emergency Fund');
    assert.strictEqual(goals[0].current, 450);
    assert.strictEqual(goals[0].target, 1000);
  });

  it('skips goals with zero or negative target', () => {
    const goals = [];
    MagnateCSV._parseGoalLine(['1', 'Test', 'Desc', '0', '0'], goals);
    assert.strictEqual(goals.length, 0);
  });

  it('skips invalid current/target values', () => {
    const goals = [];
    MagnateCSV._parseGoalLine(['1', 'Test', 'Desc', 'abc', 'xyz'], goals);
    assert.strictEqual(goals.length, 0);
  });

  it('skips lines with too few values', () => {
    const goals = [];
    MagnateCSV._parseGoalLine(['1', 'Test'], goals);
    assert.strictEqual(goals.length, 0);
  });
});

describe('_parseCalcHistoryLine', () => {
  it('parses a calculation history entry with ISO timestamp', () => {
    const history = [];
    MagnateCSV._parseCalcHistoryLine(['100+200=300', '2024-01-15T12:00:00.000Z'], history);
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].calculation, '100+200=300');
    assert.strictEqual(history[0].timestamp, '2024-01-15T12:00:00.000Z');
  });

  it('converts locale timestamp to ISO', () => {
    const history = [];
    MagnateCSV._parseCalcHistoryLine(['50+50=100', '01/15/2024 14:30'], history);
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].calculation, '50+50=100');
    assert.ok(history[0].timestamp.includes('2024-01-15'));
  });

  it('handles empty timestamp', () => {
    const history = [];
    MagnateCSV._parseCalcHistoryLine(['2+2=4'], history);
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].calculation, '2+2=4');
  });
});

describe('_parseCSVData', () => {
  it('parses a full CSV with transactions, budgets, categories, and goals', async () => {
    const csvData = `Date,Type,Title,Amount,Category
2024-01-15,Expense,Coffee,-5,Food
2024-01-16,Income,Salary,5000,Work

Month,Total Budget
2024-01,2000

Category,Default Budget
Food,300
Entertainment,100

Goal ID,Title,Description,Current,Target
1,Emergency Fund,Save 1000 by EOY,450,1000

Calculation,Timestamp
100+200=300,2024-01-15T12:00:00.000Z

Notes
Some notes here

Current Week Start,2024-01-08T00:00:00.000Z
Exported On,2024-01-20T00:00:00.000Z`;

    MagnateData.expenses = [];
    MagnateData.incomes = [];
    MagnateData.categories = [];
    MagnateData.monthlyBudgets = {};
    MagnateData.categoryBudgets = {};
    MagnateData.goals = [];
    MagnateData.calcHistory = [];
    MagnateData.notes = '';
    MagnateData.currentWeekStart = new Date();

    await MagnateCSV._parseCSVData(csvData);

    assert.strictEqual(MagnateData.expenses.length, 1);
    assert.strictEqual(MagnateData.expenses[0].title, 'Coffee');
    assert.strictEqual(MagnateData.incomes.length, 1);
    assert.strictEqual(MagnateData.incomes[0].title, 'Salary');
    assert.strictEqual(MagnateData.monthlyBudgets['2024-01'], 2000);
    assert.strictEqual(MagnateData.categories.length, 3);
    assert.strictEqual(MagnateData.goals.length, 1);
    assert.strictEqual(MagnateData.goals[0].title, 'Emergency Fund');
    assert.strictEqual(MagnateData.calcHistory.length, 1);
    assert.strictEqual(MagnateData.notes, 'Some notes here');
  });

  it('skips invalid transaction lines', async () => {
    const csvData = `Date,Type,Title,Amount,Category
invalid-date,Expense,Bad,-5,Food
2024-01-15,Expense,Good,-10,Food
2024-01-15,Expense,BadAmount,invalid,Food`;

    MagnateData.expenses = [];
    MagnateData.incomes = [];

    await MagnateCSV._parseCSVData(csvData);

    assert.strictEqual(MagnateData.expenses.length, 1);
    assert.strictEqual(MagnateData.expenses[0].title, 'Good');
  });
});

describe('_formatTimestampForExport', () => {
  it('formats an ISO timestamp to locale display', () => {
    const result = MagnateCSV._formatTimestampForExport('2024-01-15T14:30:00.000Z');
    assert.ok(result.includes('2024'));
    assert.ok(result.includes('01/15'));
  });
});