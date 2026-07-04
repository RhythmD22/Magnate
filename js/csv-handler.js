(function () {
  'use strict';

  function isValidMonthFormat(monthString) {
    return /^\d{4}-\d{2}$/.test(monthString);
  }

  function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num);
  }

  function escapeCSVField(field) {
    if (field === null || field === undefined) field = '';
    field = field.toString();
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      field = '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  function formatTimestampForExport(timestamp) {
    const dateObj = new Date(timestamp);
    return dateObj.toLocaleDateString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  function exportCSV() {
    MagnateData.loadData();

    const {
      expenses,
      incomes,
      monthlyBudgets,
      categories,
      categoryBudgets,
      goals,
      calcHistory: calculatorHistory,
      notes = '',
      currentWeekStart
    } = MagnateData;

    let csvContent = '';

    csvContent += 'Date,Type,Title,Amount,Category\n';
    expenses.forEach(exp => {
      csvContent += escapeCSVField(exp.date) + ',Expense,' + escapeCSVField(exp.title) + ',' + exp.amount + ',' + escapeCSVField(exp.category || 'Uncategorized') + '\n';
    });
    incomes.forEach(inc => {
      csvContent += escapeCSVField(inc.date) + ',Income,' + escapeCSVField(inc.title) + ',' + inc.amount + ',' + escapeCSVField(inc.category || 'Uncategorized') + '\n';
    });
    csvContent += '\n';

    csvContent += 'Month,Total Budget\n';
    Object.entries(monthlyBudgets).forEach(([key, value]) => {
      csvContent += key + ',' + value + '\n';
    });
    csvContent += '\n';

    csvContent += 'Category,Default Budget\n';
    categories.forEach(cat => {
      csvContent += escapeCSVField(cat.name) + ',' + cat.budget + '\n';
    });
    csvContent += '\n';

    csvContent += 'Month,Category,Monthly Budget\n';
    Object.entries(categoryBudgets).forEach(([monthKey, budgets]) => {
      Object.entries(budgets).forEach(([catId, budget]) => {
        const catObj = categories.find(c => String(c.id) === catId);
        const catName = catObj ? catObj.name : 'Unknown';
        csvContent += monthKey + ',' + escapeCSVField(catName) + ',' + budget + '\n';
      });
    });
    csvContent += '\n';

    csvContent += 'Goal ID,Title,Description,Current,Target\n';
    goals.forEach(goal => {
      csvContent += goal.id + ',' + escapeCSVField(goal.title) + ',' + escapeCSVField(goal.description) + ',' + (goal.current || 0) + ',' + (goal.target || 0) + '\n';
    });
    csvContent += '\n';

    csvContent += 'Calculation,Timestamp\n';
    calculatorHistory.forEach(entry => {
      const displayTimestamp = formatTimestampForExport(entry.timestamp);
      csvContent += escapeCSVField(entry.calculation) + ',' + escapeCSVField(displayTimestamp) + '\n';
    });
    csvContent += '\n';

    csvContent += 'Notes\n';
    csvContent += escapeCSVField(notes) + '\n';
    csvContent += '\n';

    csvContent += 'Current Week Start,' + (currentWeekStart ? currentWeekStart.toISOString() : '') + '\n';
    csvContent += 'Exported On,' + new Date().toISOString() + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'magnate_data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function importCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = function (event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        const csvData = e.target.result;
        parseCSVData(csvData);
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function parseTransactionLine(values, newExpenses, newIncomes) {
    if (values.length < 5) return;
    const [date, type, title, amount, category] = values;

    if (!MagnateUtils.isValidDateString(date)) {
      console.warn('Invalid date format in transaction:', date);
      return;
    }
    if (!isValidNumber(amount)) {
      console.warn('Invalid amount in transaction:', amount);
      return;
    }

    const amountNum = parseFloat(amount);
    const newId = MagnateUtils.generateId();
    const item = {
      id: newId,
      date: date,
      title: title || '',
      amount: amountNum,
      category: category === 'Uncategorized' ? '' : category
    };

    if (type === 'Expense') {
      newExpenses.push(item);
    } else if (type === 'Income') {
      newIncomes.push(item);
    } else {
      console.warn('Invalid transaction type:', type);
    }
  }

  function parseMonthlyBudgetLine(values, newMonthlyBudgets) {
    if (values.length < 2) return;
    const [month, budget] = values;
    if (!isValidMonthFormat(month)) {
      console.warn('Invalid month format:', month);
      return;
    }
    if (!isValidNumber(budget)) {
      console.warn('Invalid budget amount:', budget);
      return;
    }
    newMonthlyBudgets[month] = parseFloat(budget);
  }

  function parseCategoryLine(values, newCategories, categoryMap) {
    if (values.length < 2) return;
    const [name, budget] = values;
    if (!isValidNumber(budget)) {
      console.warn('Invalid budget amount for category:', name, budget);
      return;
    }
    const budgetNum = parseFloat(budget);
    let existingCategory = categoryMap.get(name);
    if (existingCategory) {
      existingCategory.budget = budgetNum;
    } else {
      const newCategory = { id: MagnateUtils.generateId(), name: name, budget: budgetNum };
      newCategories.push(newCategory);
      categoryMap.set(name, newCategory);
    }
  }

  function parseCategoryBudgetLine(values, newCategoryBudgets, newCategories, categoryMap) {
    if (values.length < 3) return;
    const [month, category, budget] = values;
    if (!isValidMonthFormat(month)) {
      console.warn('Invalid month format:', month);
      return;
    }
    if (!isValidNumber(budget)) {
      console.warn('Invalid budget amount:', budget);
      return;
    }
    if (!newCategoryBudgets[month]) {
      newCategoryBudgets[month] = {};
    }
    let categoryId = null;
    const categoryObj = categoryMap.get(category);
    if (categoryObj) {
      categoryId = categoryObj.id;
    } else {
      categoryId = MagnateUtils.generateId();
      const newCat = { id: categoryId, name: category, budget: 0 };
      newCategories.push(newCat);
      categoryMap.set(category, newCat);
    }
    newCategoryBudgets[month][String(categoryId)] = parseFloat(budget);
  }

  function parseGoalLine(values, newGoals) {
    if (values.length < 5) return;
    const [id, title, description, current, target] = values;
    if (!isValidNumber(current) || !isValidNumber(target)) {
      console.warn('Invalid goal values:', current, target);
      return;
    }
    const targetNum = parseFloat(target);
    if (targetNum <= 0) {
      console.warn('Goal target must be greater than 0:', target);
      return;
    }
    newGoals.push({
      id: parseInt(id) || MagnateUtils.generateId(),
      title: title || '',
      description: description || '',
      current: parseFloat(current),
      target: targetNum
    });
  }

  function parseCalcHistoryLine(values, newCalculatorHistory) {
    if (values.length < 1) return;
    const [calculation, timestamp] = values;
    let isoTimestamp = timestamp;

    if (/^\d{1,2}\/\d{1,2}\/\d{4} \d{2}:\d{2}$/.test(timestamp)) {
      const [datePart, timePart] = timestamp.split(' ');
      const dateObj = MagnateUtils.dateStringToDateObject(datePart);
      const [hours, minutes] = timePart.split(':');
      dateObj.setHours(parseInt(hours), parseInt(minutes));
      isoTimestamp = dateObj.toISOString();
    }

    newCalculatorHistory.push({
      calculation: calculation || '',
      timestamp: isoTimestamp
    });
  }

  function detectSection(line) {
    if (line === 'Date,Type,Title,Amount,Category') return 'transactions';
    if (line === 'Month,Total Budget') return 'monthlyBudgets';
    if (line === 'Category,Default Budget') return 'categories';
    if (line === 'Month,Category,Monthly Budget') return 'categoryBudgets';
    if (line === 'Goal ID,Title,Description,Current,Target') return 'goals';
    if (line === 'Calculation,Timestamp') return 'calculatorHistory';
    if (line === 'Notes') return 'notes';
    if (line.startsWith('Current Week Start,')) return 'metadata';
    return null;
  }

  async function parseCSVData(csvData) {
    MagnateData.loadData();
    const existingCategories = MagnateData.categories;

    const newExpenses = [];
    const newIncomes = [];
    const newMonthlyBudgets = {};
    const newCategories = [...existingCategories];
    const newCategoryBudgets = {};
    const newGoals = [];
    const newCalculatorHistory = [];
    let newNotes = '';
    let newCurrentWeekStart = '';

    const categoryMap = new Map();
    newCategories.forEach(cat => categoryMap.set(cat.name, cat));

    const lines = csvData.split('\n');
    let section = '';
    let lineIndex = 0;

    while (lineIndex < lines.length) {
      const line = lines[lineIndex].trim();
      lineIndex++;

      const detected = detectSection(line);
      if (detected) {
        section = detected;
        continue;
      }

      if (!line) continue;

      const values = parseCSVLine(line);

      switch (section) {
        case 'transactions':
          parseTransactionLine(values, newExpenses, newIncomes);
          break;

        case 'monthlyBudgets':
          parseMonthlyBudgetLine(values, newMonthlyBudgets);
          break;

        case 'categories':
          parseCategoryLine(values, newCategories, categoryMap);
          break;

        case 'categoryBudgets':
          parseCategoryBudgetLine(values, newCategoryBudgets, newCategories, categoryMap);
          break;

        case 'goals':
          parseGoalLine(values, newGoals);
          break;

        case 'calculatorHistory':
          parseCalcHistoryLine(values, newCalculatorHistory);
          break;

        case 'notes':
          {
            const notesLines = [];
            const isBoundary = (l) => detectSection(l) || l.startsWith('Current Week Start,') || l.startsWith('Exported On');

            if (isBoundary(line)) {
              const nextSection = detectSection(line);
              if (nextSection) {
                section = nextSection;
              } else if (line.startsWith('Current Week Start,')) {
                section = 'metadata';
              } else {
                section = '';
              }
              break;
            }

            const firstValues = parseCSVLine(line);
            if (firstValues.length > 0) {
              notesLines.push(firstValues[0]);
            }

            while (lineIndex < lines.length) {
              const nextLine = lines[lineIndex].trim();
              if (!nextLine) { lineIndex++; continue; }
              if (isBoundary(nextLine)) break;
              const nextValues = parseCSVLine(nextLine);
              if (nextValues.length > 0) {
                notesLines.push(nextValues[0]);
              }
              lineIndex++;
            }

            newNotes = notesLines.join('\n');
          }
          break;

        case 'metadata':
          if (values[0] === 'Current Week Start') {
            if (values[1]) {
              if (!MagnateUtils.isValidDateString(values[1])) {
                console.warn('Invalid date format for current week start:', values[1]);
                break;
              }
            }
            newCurrentWeekStart = values[1];
          }
          break;
      }
    }

    const confirmed = await MagnateUI.confirm('Importing this data will replace all current data. Are you sure you want to continue?');
    if (confirmed) {
      MagnateData.expenses = newExpenses;
      MagnateData.incomes = newIncomes;
      MagnateData.monthlyBudgets = newMonthlyBudgets;
      MagnateData.categories = newCategories;
      MagnateData.categoryBudgets = newCategoryBudgets;
      MagnateData.goals = newGoals;
      MagnateData.calcHistory = newCalculatorHistory;
      MagnateData.notes = newNotes;
      if (newCurrentWeekStart) {
        MagnateData.currentWeekStart = new Date(newCurrentWeekStart);
      }

      MagnateData.saveData();

      await MagnateUI.alert('Data imported successfully!');

      location.reload();
    }
  }

  window.MagnateCSV = {
    exportCSV: exportCSV,
    importCSV: importCSV
  };
})();