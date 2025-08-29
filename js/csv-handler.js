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
    let mealPlans = JSON.parse(localStorage.getItem('mealPlans')) || [
        {
            id: "default",
            title: "Meal Plan",
            category:
                "For accurate analytics, please use consistent category names across all entries (expenses, incomes, and meal plans). For example, if you label an expense as 'Groceries,' use 'Groceries' for your meal plan category as well.",
            description: "",
            deductions: []
        }
    ];
    let calculatorHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];
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

    // Meal Plans Section
    csvContent += 'Meal Plan ID,Title,Category,Description,Deductions\n';
    mealPlans.forEach(plan => {
        // Skip the default plan
        if (plan.id === "default") return;

        // Process deductions
        let deductionsStr = '';
        if (plan.deductions && plan.deductions.length > 0) {
            deductionsStr = plan.deductions.map(d => {
                return `${escapeCSVField(d.description)}|${escapeCSVField(d.category)}|${d.amount}`;
            }).join(';');
        }

        csvContent += `${plan.id},${escapeCSVField(plan.title)},${escapeCSVField(plan.category)},${escapeCSVField(plan.description)},"${deductionsStr}"\n`;
    });
    csvContent += '\n';

    // Calculator History Section
    csvContent += 'Calculation\n';
    calculatorHistory.forEach(entry => {
        csvContent += `${escapeCSVField(entry)}\n`;
    });
    csvContent += '\n';

    // Additional Information
    csvContent += `Current Week Start,${currentWeekStart}\n`;
    csvContent += `Exported On,${new Date().toISOString()}\n`;

    // Create a blob and trigger download
    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'financier_data_export.csv');
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
    let newMealPlans = [
        {
            id: "default",
            title: "Meal Plan",
            category:
                "For accurate analytics, please use consistent category names across all entries (expenses, incomes, and meal plans). For example, if you label an expense as 'Groceries,' use 'Groceries' for your meal plan category as well.",
            description: "",
            deductions: []
        }
    ]; // Start with default meal plan
    let newCalculatorHistory = []; // New array for calculator history
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
        } else if (line === 'Meal Plan ID,Title,Category,Description,Deductions') {
            section = 'mealPlans';
            continue;
        } else if (line === 'Calculation') {
            section = 'calculatorHistory';
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

            case 'mealPlans':
                if (values.length >= 5) {
                    const [id, title, category, description, deductions] = values;

                    // Parse deductions if they exist
                    let deductionArray = [];
                    if (deductions && deductions !== '""' && deductions !== '"' && deductions !== '') {
                        // Remove surrounding quotes if they exist
                        let deductionsStr = deductions;
                        if (deductionsStr.startsWith('"') && deductionsStr.endsWith('"')) {
                            deductionsStr = deductionsStr.slice(1, -1);
                        }
                        // Split by semicolon to get each deduction
                        const deductionItems = deductionsStr.split(';');
                        deductionArray = deductionItems.map(item => {
                            // Split by pipe to get description, category, and amount
                            const parts = item.split('|');
                            return {
                                description: parts[0] || '',
                                category: parts[1] || '',
                                amount: parseFloat(parts[2]) || 0
                            };
                        });
                    }

                    // Skip the default plan
                    if (id !== "default") {
                        newMealPlans.push({
                            id: id || Date.now() + Math.floor(Math.random() * 10000),
                            title: title || '',
                            category: category || '',
                            description: description || '',
                            deductions: deductionArray
                        });
                    }
                }
                break;

            case 'calculatorHistory':
                if (values.length >= 1) {
                    const [calculation] = values;
                    newCalculatorHistory.push(calculation || '');
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
        localStorage.setItem('mealPlans', JSON.stringify(newMealPlans)); // Save meal plans
        localStorage.setItem('calcHistory', JSON.stringify(newCalculatorHistory)); // Save calculator history
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