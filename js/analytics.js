/* Utility & Helper Functions */
function promptNumber(message) {
    let input;
    do {
        input = prompt(message);
        if (input === null) return null;
    } while (isNaN(parseFloat(input)) || input.trim() === "");
    return parseFloat(input);
}

function promptDate(message) {
    let dateInput = prompt(message + " (YYYY-MM-DD) or leave blank for today:");
    if (dateInput === null) return null;
    dateInput = dateInput.trim();
    if (dateInput === "") {
        return new Date().toISOString().slice(0, 10);
    }
    return dateInput;
}

function generateId() {
    return Date.now();
}

// Function to get Monday of a given date
function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(date.setDate(diff));
}

/* Shared Data Storage */
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
// Predefined categories for budgets. These are used only as a reference for budget values.
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: "Entertainment", budget: 100 },
    { id: 2, name: "Academic", budget: 150 },
    { id: 3, name: "Food", budget: 300 }
];
// Retrieve the month-specific category budgets
let categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets')) || {};

// For toggling weekly and monthly category views
let categoryView = 'spending';
let monthlyCategoryView = 'spending';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toggleCategoryView').addEventListener('click', () => {
        categoryView = (categoryView === 'spending') ? 'income' : 'spending';
        document.getElementById('categoryCardTitle').textContent =
            (categoryView === 'spending') ? 'Weekly Spending by Category:' : 'Weekly Income by Category:';
        updateCategoryCards();
    });

    document.getElementById('toggleMonthlyView').addEventListener('click', () => {
        monthlyCategoryView = (monthlyCategoryView === 'spending') ? 'income' : 'spending';
        document.getElementById('monthlyCardTitle').textContent =
            (monthlyCategoryView === 'spending') ? 'Monthly Spending by Category:' : 'Monthly Income by Category:';
        updateMonthlyCategoryCards();
    });
});

/* Week Navigation */
// Initialize currentWeekStart from localStorage or set to Monday of today
let currentWeekStart = localStorage.getItem('currentWeekStart')
    ? new Date(localStorage.getItem('currentWeekStart'))
    : getMonday(new Date());

function updateWeekLabel() {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById('weekLabel').textContent =
        'Week of ' + currentWeekStart.toLocaleDateString(undefined, options);
}

// Prev/Next week event listeners
document.getElementById('btnPrevWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
    updateAnalytics();
});

document.getElementById('btnNextWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
    updateAnalytics();
});

// Save data to localStorage
function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('incomes', JSON.stringify(incomes));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
}

/* Overall Analytics Logic */
function updateAnalytics() {
    let year = currentWeekStart.getFullYear();
    let month = currentWeekStart.getMonth();
    let firstDay = new Date(year, month, 1);
    let nextMonth = new Date(year, month + 1, 1);
    let startStrMonth = firstDay.toISOString().slice(0, 10);
    let endStrMonth = nextMonth.toISOString().slice(0, 10);

    let monthlyExpenses = expenses.filter(exp =>
        exp.date.slice(0, 10) >= startStrMonth && exp.date.slice(0, 10) < endStrMonth
    );
    let totalMonthlyExpenses = monthlyExpenses.reduce(
        (sum, exp) => sum + Math.abs(exp.amount),
        0
    );

    let monthlyBudgets = JSON.parse(localStorage.getItem('monthlyBudgets')) || {};
    let key = year + '-' + ("0" + (month + 1)).slice(-2);
    let totalBudget = monthlyBudgets[key] || 1000;

    // Update budget amounts
    document.getElementById('totalBudget').textContent = '$' + totalBudget;
    let remaining = totalBudget - totalMonthlyExpenses;
    document.getElementById('remainingBudget').textContent = '$' + remaining;

    // Update progress circle
    let percentage = totalBudget > 0
        ? (totalMonthlyExpenses / totalBudget) * 100
        : 0;
    percentage = Math.min(100, Math.round(percentage));
    document.getElementById('progressText').innerHTML = percentage + '%<br/>Spent';

    let circumference = 628;
    let offset = circumference * (1 - percentage / 100);
    document.getElementById('progressCircle').style.strokeDashoffset = offset;

    renderWeeklyChart();
    updateCategoryCards();

    updateMonthlyCategoryCards();

    updateWeekLabel();
    saveData();
}

/* Weekly Chart */
let weeklyChart;
function renderWeeklyChart() {
    let mondayStr = currentWeekStart.toISOString().slice(0, 10);
    let weekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    let weekEndStr = weekEnd.toISOString().slice(0, 10);

    // Build the 7-day labels
    let weekDates = [];
    let labels = [];
    for (let i = 0; i < 7; i++) {
        let dt = new Date(currentWeekStart);
        dt.setDate(dt.getDate() + i);
        weekDates.push(dt);
        labels.push(dt.toLocaleDateString(undefined, { weekday: 'short' }));
    }

    let expenseData = [];
    let incomeData = [];
    let combinedData = [];

    weekDates.forEach(d => {
        let dayStr = d.toISOString().slice(0, 10);
        let expenseSum = expenses
            .filter(e => e.date.slice(0, 10) === dayStr)
            .reduce((sum, e) => sum + Math.abs(e.amount), 0);
        let incomeSum = incomes
            .filter(i => i.date.slice(0, 10) === dayStr)
            .reduce((sum, i) => sum + Math.abs(i.amount), 0);

        expenseData.push(expenseSum);
        incomeData.push(incomeSum);
        combinedData.push(expenseSum + incomeSum);
    });

    let maxCombined = Math.max(...combinedData);
    let remainder = maxCombined % 10;
    let globalMax = remainder !== 0 ? maxCombined + (10 - remainder) : maxCombined;
    if (globalMax === 0) globalMax = 10;

    const ctx = document.getElementById('weeklyChart').getContext('2d');
    if (weeklyChart) weeklyChart.destroy();

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#dd524c',
                    borderColor: '#dd524c',
                    borderWidth: 1
                },
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#5ec269',
                    borderColor: '#5ec269',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: globalMax,
                    stacked: true,
                    ticks: {
                        stepSize: 10,
                        color: '#A3A3A3'
                    },
                    grid: {
                        color: '#3A3D42'
                    },
                    title: {
                        display: true,
                        text: 'Amount ($)',
                        color: '#FFFFFF',
                        font: { size: 14 }
                    }
                },
                x: {
                    stacked: true,
                    grid: { color: '#3A3D42' },
                    ticks: { color: '#A3A3A3' },
                    title: {
                        display: true,
                        text: 'Days of the Week',
                        color: '#FFFFFF',
                        font: { size: 14 }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label ? context.dataset.label + ': ' : '';
                            return label + '$' + context.parsed.y;
                        }
                    }
                },
                legend: { display: true }
            }
        }
    });
}

/* Weekly Category Cards */
function updateCategoryCards() {
    const container = document.getElementById('categoriesCards');
    container.innerHTML = '';

    let mondayStr = currentWeekStart.toISOString().slice(0, 10);
    let weekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    let weekEndStr = weekEnd.toISOString().slice(0, 10);

    // Determine the current month key based on currentWeekStart
    let year = currentWeekStart.getFullYear();
    let month = currentWeekStart.getMonth();
    let monthKey = year + '-' + ('0' + (month + 1)).slice(-2);

    if (categoryView === 'spending') {
        let expenseGroups = {};

        expenses
            .filter(e => e.date.slice(0, 10) >= mondayStr && e.date.slice(0, 10) <= weekEndStr)
            .forEach(e => {
                let catName = (e.category || "Uncategorized").trim();
                let key = catName.toLowerCase();
                let catObj = categories.find(c => c.name.trim().toLowerCase() === key);
                let catBudget = 0;
                if (catObj) {
                    const catIdStr = String(catObj.id);
                    if (categoryBudgets[monthKey] && categoryBudgets[monthKey][catIdStr] !== undefined) {
                        catBudget = categoryBudgets[monthKey][catIdStr];
                    } else {
                        catBudget = catObj.budget;
                    }
                }
                if (!expenseGroups[key]) {
                    expenseGroups[key] = { name: catName, total: 0, budget: catBudget };
                }
                expenseGroups[key].total += Math.abs(e.amount);
            });

        // Render the grouped expense categories
        for (let key in expenseGroups) {
            let group = expenseGroups[key];
            let totalAmount = group.total;
            let budget = group.budget;
            let percentage = (budget > 0) ? (totalAmount / budget) * 100 : 0;
            percentage = Math.min(100, percentage);
            let color = '#e77975';

            let card = document.createElement('div');
            card.className = 'expense-category-card';

            let title = document.createElement('div');
            title.className = 'expense-category-title';
            title.textContent = group.name;
            title.style.color = color;
            card.appendChild(title);
            if (totalAmount > budget) {
                let exceededLabel = document.createElement('div');
                exceededLabel.textContent = '(Exceeded)';
                exceededLabel.style.color = '#dd524c';
                exceededLabel.style.fontSize = '0.9rem';
                card.appendChild(exceededLabel);
            }

            let breakdown = document.createElement('div');
            breakdown.className = 'expense-category-breakdown';
            breakdown.innerHTML = `
         <span class="percentage" style="color: ${color};">
           ${Math.round(percentage)}%
         </span>
         ($${totalAmount.toFixed(2)}/$${budget})
       `;
            card.appendChild(breakdown);

            let progressBar = document.createElement('div');
            progressBar.className = 'category-progress-bar';

            let progressFill = document.createElement('div');
            progressFill.className = 'category-progress-fill';
            progressFill.style.width = percentage + '%';
            progressFill.style.backgroundColor = color;

            progressBar.appendChild(progressFill);
            card.appendChild(progressBar);
            container.appendChild(card);
        }
    } else {
        // Weekly Income by Category
        let incomeGroups = {};
        incomes
            .filter(i => i.date.slice(0, 10) >= mondayStr && i.date.slice(0, 10) <= weekEndStr)
            .forEach(i => {
                let catName = (i.category || "Uncategorized").trim();
                let key = catName.toLowerCase();
                if (!incomeGroups[key]) {
                    incomeGroups[key] = { name: catName, total: 0 };
                }
                incomeGroups[key].total += Math.abs(i.amount);
            });

        for (let key in incomeGroups) {
            let group = incomeGroups[key];
            let budget = group.total;
            let percentage = (budget > 0) ? (group.total / budget) * 100 : 0;
            percentage = Math.min(100, percentage);
            let color = '#69cd9b';

            let card = document.createElement('div');
            card.className = 'expense-category-card';

            let title = document.createElement('div');
            title.className = 'expense-category-title';
            title.textContent = group.name;
            title.style.color = color;
            card.appendChild(title);

            let breakdown = document.createElement('div');
            breakdown.className = 'expense-category-breakdown';
            breakdown.innerHTML = `
         <span class="percentage" style="color: ${color};">
           ${Math.round(percentage)}%
         </span>
         ($${group.total.toFixed(2)}/$${budget})
       `;
            card.appendChild(breakdown);

            let progressBar = document.createElement('div');
            progressBar.className = 'category-progress-bar';

            let progressFill = document.createElement('div');
            progressFill.className = 'category-progress-fill';
            progressFill.style.width = percentage + '%';
            progressFill.style.backgroundColor = color;

            progressBar.appendChild(progressFill);
            card.appendChild(progressBar);
            container.appendChild(card);
        }
    }
}

/* Monthly Category Cards */
function updateMonthlyCategoryCards() {
    const container = document.getElementById('monthlyCategoryCards');
    container.innerHTML = '';

    // Determine the monthly range using currentWeekStart
    let year = currentWeekStart.getFullYear();
    let month = currentWeekStart.getMonth();
    let firstDay = new Date(year, month, 1);
    let nextMonth = new Date(year, month + 1, 1);
    let startDate = firstDay.toISOString().slice(0, 10);
    let endDate = nextMonth.toISOString().slice(0, 10);

    // Compute the month key
    let monthKey = year + '-' + ('0' + (month + 1)).slice(-2);

    if (monthlyCategoryView === 'spending') {
        let expenseGroups = {};

        expenses
            .filter(e => e.date.slice(0, 10) >= startDate && e.date.slice(0, 10) < endDate)
            .forEach(e => {
                let catName = (e.category || "Uncategorized").trim();
                let key = catName.toLowerCase();
                let catObj = categories.find(c => c.name.trim().toLowerCase() === key);
                let catBudget = 0;
                if (catObj) {
                    const catIdStr = String(catObj.id);
                    if (categoryBudgets[monthKey] && categoryBudgets[monthKey][catIdStr] !== undefined) {
                        catBudget = categoryBudgets[monthKey][catIdStr];
                    } else {
                        catBudget = catObj.budget;
                    }
                }
                if (!expenseGroups[key]) {
                    expenseGroups[key] = { name: catName, total: 0, budget: catBudget };
                }
                expenseGroups[key].total += Math.abs(e.amount);
            });

        for (let key in expenseGroups) {
            let group = expenseGroups[key];
            let totalAmount = group.total;
            let budget = group.budget;
            let percentage = (budget > 0) ? (totalAmount / budget) * 100 : 0;
            percentage = Math.min(100, percentage);
            let color = '#e77975';

            let card = document.createElement('div');
            card.className = 'expense-category-card';

            let title = document.createElement('div');
            title.className = 'expense-category-title';
            title.textContent = group.name;
            title.style.color = color;
            card.appendChild(title);
            if (totalAmount > budget) {
                let exceededLabel = document.createElement('div');
                exceededLabel.textContent = '(Exceeded)';
                exceededLabel.style.color = '#dd524c';
                exceededLabel.style.fontSize = '0.9rem';
                card.appendChild(exceededLabel);
            }

            let breakdown = document.createElement('div');
            breakdown.className = 'expense-category-breakdown';
            breakdown.innerHTML = `
         <span class="percentage" style="color: ${color};">
           ${Math.round(percentage)}%
         </span>
         ($${totalAmount.toFixed(2)}/$${budget})
       `;
            card.appendChild(breakdown);

            let progressBar = document.createElement('div');
            progressBar.className = 'category-progress-bar';

            let progressFill = document.createElement('div');
            progressFill.className = 'category-progress-fill';
            progressFill.style.width = percentage + '%';
            progressFill.style.backgroundColor = color;

            progressBar.appendChild(progressFill);
            card.appendChild(progressBar);
            container.appendChild(card);
        }
    } else {
        // Monthly Income by Category
        let incomeGroups = {};
        incomes
            .filter(i => i.date.slice(0, 10) >= startDate && i.date.slice(0, 10) < endDate)
            .forEach(i => {
                let catName = (i.category || "Uncategorized").trim();
                let key = catName.toLowerCase();
                if (!incomeGroups[key]) {
                    incomeGroups[key] = { name: catName, total: 0 };
                }
                incomeGroups[key].total += Math.abs(i.amount);
            });
        for (let key in incomeGroups) {
            let group = incomeGroups[key];
            let budget = group.total;
            let percentage = (budget > 0) ? (group.total / budget) * 100 : 0;
            percentage = Math.min(100, percentage);
            let color = '#6ad09d';

            let card = document.createElement('div');
            card.className = 'expense-category-card';

            let title = document.createElement('div');
            title.className = 'expense-category-title';
            title.textContent = group.name;
            title.style.color = color;
            card.appendChild(title);

            let breakdown = document.createElement('div');
            breakdown.className = 'expense-category-breakdown';
            breakdown.innerHTML = `
         <span class="percentage" style="color: ${color};">
           ${Math.round(percentage)}%
         </span>
         ($${group.total.toFixed(2)}/$${budget})
       `;
            card.appendChild(breakdown);

            let progressBar = document.createElement('div');
            progressBar.className = 'category-progress-bar';

            let progressFill = document.createElement('div');
            progressFill.className = 'category-progress-fill';
            progressFill.style.width = percentage + '%';
            progressFill.style.backgroundColor = color;

            progressBar.appendChild(progressFill);
            card.appendChild(progressBar);
            container.appendChild(card);
        }
    }
}

/* Final Render Calls */
updateAnalytics();