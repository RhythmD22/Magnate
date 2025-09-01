// Helper function to escape CSV fields
function escapeCSVField(field) {
    if (field === null || field === undefined) field = '';
    field = field.toString();
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        // Escape quotes and wrap in quotes
        field = `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

// Helper function to parse CSV lines with proper quote handling
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && !inQuotes) {
            inQuotes = true;
        } else if (char === '"' && inQuotes) {
            // Check if it's an escaped quote
            if (i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // Skip the next quote
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

    result.push(current); // Add the last field
    return result;
}

function exportCSV() {
    // Retrieve data from localStorage
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    let monthlyBudgets = JSON.parse(localStorage.getItem('monthlyBudgets')) || {};
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    let categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets')) || {};
    let goals = JSON.parse(localStorage.getItem('goals')) || [];
    let calculatorHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];
    let notes = localStorage.getItem('notes') || ''; // Get notes from localStorage
    let currentWeekStart = localStorage.getItem('currentWeekStart') || '';

    let csvContent = '';

    // Transactions Section
    csvContent += 'Date,Type,Title,Amount,Category\n';
    expenses.forEach(exp => {
        csvContent += `${exp.date},Expense,${escapeCSVField(exp.title)},${exp.amount},${escapeCSVField(exp.category || 'Uncategorized')}\n`;
    });
    incomes.forEach(inc => {
        csvContent += `${inc.date},Income,${escapeCSVField(inc.title)},${inc.amount},${escapeCSVField(inc.category || 'Uncategorized')}\n`;
    });
    csvContent += '\n';

    // Monthly Budgets Section
    csvContent += 'Month,Total Budget\n';
    for (let key in monthlyBudgets) {
        csvContent += `${key},${monthlyBudgets[key]}\n`;
    }
    csvContent += '\n';

    // Expense Categories (Default Budgets) Section
    csvContent += 'Category,Default Budget\n';
    categories.forEach(cat => {
        csvContent += `${escapeCSVField(cat.name)},${cat.budget}\n`;
    });
    csvContent += '\n';

    // Category Budgets per Month
    csvContent += 'Month,Category,Monthly Budget\n';
    for (let monthKey in categoryBudgets) {
        let budgets = categoryBudgets[monthKey];
        for (let catId in budgets) {
            let catObj = categories.find(c => String(c.id) === catId);
            let catName = catObj ? catObj.name : 'Unknown';
            csvContent += `${monthKey},${escapeCSVField(catName)},${budgets[catId]}\n`;
        }
    }
    csvContent += '\n';

    // Financial Goals Section
    csvContent += 'Goal ID,Title,Description,Current,Target\n';
    goals.forEach(goal => {
        csvContent += `${goal.id},${escapeCSVField(goal.title)},${escapeCSVField(goal.description)},${goal.current || 0},${goal.target || 0}\n`;
    });
    csvContent += '\n';

    // Calculator History Section
    csvContent += 'Calculation,Timestamp\n';
    calculatorHistory.forEach(entry => {
        // Format the ISO timestamp for export
        const dateObj = new Date(entry.timestamp);
        // Export format: MM/DD/YYYY HH:MM
        const displayTimestamp = dateObj.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
            dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        csvContent += `${escapeCSVField(entry.calculation)},${escapeCSVField(displayTimestamp)}\n`;
    });
    csvContent += '\n';

    // Notes Section
    csvContent += 'Notes\n';
    csvContent += `${escapeCSVField(notes)}\n`;
    csvContent += '\n';

    // Additional Information
    csvContent += `Current Week Start,${currentWeekStart}\n`;
    csvContent += `Exported On,${new Date().toISOString()}\n`;

    // Create a blob and trigger download
    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'magnate_data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

function parseCSVData(csvData) {
    // Get existing data to preserve IDs where possible
    let existingCategories = JSON.parse(localStorage.getItem('categories')) || [];

    // Initialize data objects
    let newExpenses = [];
    let newIncomes = [];
    let newMonthlyBudgets = {};
    let newCategories = [...existingCategories]; // Start with existing categories
    let newCategoryBudgets = {};
    let newGoals = []; // New array for goals
    let newCalculatorHistory = []; // New array for calculator history
    let newNotes = ''; // New variable for notes
    let newCurrentWeekStart = '';

    // Split CSV into lines
    const lines = csvData.split('\n');
    let section = '';
    let lineIndex = 0;

    // Parse CSV sections
    while (lineIndex < lines.length) {
        const line = lines[lineIndex].trim();
        lineIndex++;

        if (line === 'Date,Type,Title,Amount,Category') {
            section = 'transactions';
            continue;
        } else if (line === 'Month,Total Budget') {
            section = 'monthlyBudgets';
            continue;
        } else if (line === 'Category,Default Budget') {
            section = 'categories';
            continue;
        } else if (line === 'Month,Category,Monthly Budget') {
            section = 'categoryBudgets';
            continue;
        } else if (line === 'Goal ID,Title,Description,Current,Target') {
            section = 'goals';
            continue;
        } else if (line === 'Calculation,Timestamp') {
            section = 'calculatorHistory';
            continue;
        } else if (line === 'Notes') {
            section = 'notes';
            continue;
        } else if (line.startsWith('Current Week Start,')) {
            section = 'metadata';
        }

        if (!line) continue;

        // Parse line with proper CSV handling
        const values = parseCSVLine(line);

        switch (section) {
            case 'transactions':
                if (values.length >= 5) {
                    const [date, type, title, amount, category] = values;

                    // Generate a new ID for each transaction
                    const newId = Date.now() + Math.floor(Math.random() * 10000);
                    if (type === 'Expense') {
                        newExpenses.push({
                            id: newId,
                            date: date,
                            title: title || '',
                            amount: parseFloat(amount),
                            category: category === 'Uncategorized' ? '' : category
                        });
                    } else if (type === 'Income') {
                        newIncomes.push({
                            id: newId,
                            date: date,
                            title: title || '',
                            amount: parseFloat(amount),
                            category: category === 'Uncategorized' ? '' : category
                        });
                    }
                }
                break;

            case 'monthlyBudgets':
                if (values.length >= 2) {
                    const [month, budget] = values;
                    newMonthlyBudgets[month] = parseFloat(budget);
                }
                break;

            case 'categories':
                if (values.length >= 2) {
                    const [name, budget] = values;
                    // Check if category already exists
                    let existingCategory = newCategories.find(cat => cat.name === name);
                    if (existingCategory) {
                        // Update existing category budget
                        existingCategory.budget = parseFloat(budget);
                    } else {
                        // Add new category with new ID
                        newCategories.push({
                            id: Date.now() + Math.floor(Math.random() * 10000),
                            name: name,
                            budget: parseFloat(budget)
                        });
                    }
                }
                break;

            case 'categoryBudgets':
                if (values.length >= 3) {
                    const [month, category, budget] = values;
                    if (!newCategoryBudgets[month]) {
                        newCategoryBudgets[month] = {};
                    }
                    // Find category ID
                    let categoryId = null;
                    for (let cat of newCategories) {
                        if (cat.name === category) {
                            categoryId = cat.id;
                            break;
                        }
                    }
                    // If category doesn't exist, create it
                    if (!categoryId) {
                        categoryId = Date.now() + Math.floor(Math.random() * 10000);
                        newCategories.push({
                            id: categoryId,
                            name: category,
                            budget: 0 // Default budget
                        });
                    }
                    const categoryIdStr = String(categoryId);
                    newCategoryBudgets[month][categoryIdStr] = parseFloat(budget);
                }
                break;

            case 'goals':
                if (values.length >= 5) {
                    const [id, title, description, current, target] = values;

                    newGoals.push({
                        id: parseInt(id) || Date.now() + Math.floor(Math.random() * 10000),
                        title: title || '',
                        description: description || '',
                        current: parseFloat(current) || 0,
                        target: parseFloat(target) || 0
                    });
                }
                break;

            case 'calculatorHistory':
                if (values.length >= 1) {
                    const [calculation, timestamp] = values;
                    // Parse the display timestamp back to ISO format
                    let isoTimestamp = timestamp;
                    // If it looks like a display timestamp (MM/DD/YYYY HH:MM), convert it to ISO
                    if (/^\d{1,2}\/\d{1,2}\/\d{4} \d{2}:\d{2}$/.test(timestamp)) {
                        const [datePart, timePart] = timestamp.split(' ');
                        const [month, day, year] = datePart.split('/');
                        const [hours, minutes] = timePart.split(':');
                        const dateObj = new Date(year, month - 1, day, hours, minutes);
                        isoTimestamp = dateObj.toISOString();
                    }

                    newCalculatorHistory.push({
                        calculation: calculation || '',
                        timestamp: isoTimestamp
                    });
                }
                break;

            case 'notes':
                // Collect all lines until we reach the next section
                let notesLines = [];

                // Add the current line if it's not a metadata line
                if (line !== 'Current Week Start,' && !line.startsWith('Current Week Start,')) {
                    // Parse the line properly to handle CSV escaping
                    const currentValues = parseCSVLine(line);
                    if (currentValues.length > 0) {
                        notesLines.push(currentValues[0]);
                    }
                }

                // Continue collecting lines until we find a section header
                while (lineIndex < lines.length) {
                    const nextLine = lines[lineIndex].trim();
                    // Check if this is a new section header
                    if (nextLine === 'Current Week Start,' ||
                        nextLine.startsWith('Current Week Start,') ||
                        nextLine === 'Date,Type,Title,Amount,Category' ||
                        nextLine === 'Month,Total Budget' ||
                        nextLine === 'Category,Default Budget' ||
                        nextLine === 'Month,Category,Monthly Budget' ||
                        nextLine === 'Goal ID,Title,Description,Current,Target' ||
                        nextLine === 'Calculation,Timestamp') {
                        break;
                    }

                    // If not a section header, add it to notes
                    if (lineIndex < lines.length) {
                        // Parse the line properly to handle CSV escaping
                        const nextValues = parseCSVLine(lines[lineIndex]);
                        if (nextValues.length > 0 && nextValues[0] !== 'Exported On') {
                            notesLines.push(nextValues[0]);
                        }
                        lineIndex++;
                    }
                }

                newNotes = notesLines.join('\n');

                // Determine what the next section is
                if (lineIndex < lines.length) {
                    const nextLine = lines[lineIndex].trim();
                    if (nextLine === 'Current Week Start,' || nextLine.startsWith('Current Week Start,')) {
                        section = 'metadata';
                    } else if (nextLine === 'Date,Type,Title,Amount,Category') {
                        section = 'transactions';
                    } else if (nextLine === 'Month,Total Budget') {
                        section = 'monthlyBudgets';
                    } else if (nextLine === 'Category,Default Budget') {
                        section = 'categories';
                    } else if (nextLine === 'Month,Category,Monthly Budget') {
                        section = 'categoryBudgets';
                    } else if (nextLine === 'Goal ID,Title,Description,Current,Target') {
                        section = 'goals';
                    } else if (nextLine === 'Calculation,Timestamp') {
                        section = 'calculatorHistory';
                    }
                    // Continue to process this line in the next iteration
                    continue;
                }
                break;

            case 'metadata':
                if (values[0] === 'Current Week Start') {
                    newCurrentWeekStart = values[1];
                }
                break;
        }
    }

    // Confirm with user before importing
    if (confirm('Importing this data will replace all current data. Are you sure you want to continue?')) {
        // Update localStorage with new data
        localStorage.setItem('expenses', JSON.stringify(newExpenses));
        localStorage.setItem('incomes', JSON.stringify(newIncomes));
        localStorage.setItem('monthlyBudgets', JSON.stringify(newMonthlyBudgets));
        localStorage.setItem('categories', JSON.stringify(newCategories));
        localStorage.setItem('categoryBudgets', JSON.stringify(newCategoryBudgets));
        localStorage.setItem('goals', JSON.stringify(newGoals)); // Save goals
        localStorage.setItem('calcHistory', JSON.stringify(newCalculatorHistory)); // Save calculator history
        localStorage.setItem('notes', newNotes); // Save notes
        if (newCurrentWeekStart) {
            localStorage.setItem('currentWeekStart', newCurrentWeekStart);
        }

        // Reload the page to reflect changes
        location.reload();
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('exportCSV');
    const importBtn = document.getElementById('importCSV');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportCSV);
    }

    if (importBtn) {
        importBtn.addEventListener('click', importCSV);
    }
});