/* Utility & Helper Functions */
// All utility functions have been moved to utils.js

// For toggling weekly and monthly category views
let categoryView = 'spending';
let monthlyCategoryView = 'spending';

/**
 * Initialize event listeners when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const toggleCategoryViewBtn = document.getElementById('toggleCategoryView');
    if (toggleCategoryViewBtn) {
        toggleCategoryViewBtn.addEventListener('click', () => {
            categoryView = (categoryView === 'spending') ? 'income' : 'spending';
            const categoryCardTitle = document.getElementById('categoryCardTitle');
            if (categoryCardTitle) {
                categoryCardTitle.textContent =
                    (categoryView === 'spending') ? 'Weekly Spending by Category:' : 'Weekly Income by Category:';
            }
            updateCategoryCards();
        });
    }

    const toggleMonthlyViewBtn = document.getElementById('toggleMonthlyView');
    if (toggleMonthlyViewBtn) {
        toggleMonthlyViewBtn.addEventListener('click', () => {
            monthlyCategoryView = (monthlyCategoryView === 'spending') ? 'income' : 'spending';
            const monthlyCardTitle = document.getElementById('monthlyCardTitle');
            if (monthlyCardTitle) {
                monthlyCardTitle.textContent =
                    (monthlyCategoryView === 'spending') ? 'Monthly Spending by Category:' : 'Monthly Income by Category:';
            }
            updateMonthlyCategoryCards();
        });
    }
});

/* Week Navigation */
// Use centralized data management
let currentWeekStart = MagnateData.currentWeekStart;

/**
 * Update the week label display
 */
function updateWeekLabel() {
    // Format as "Week of Month Day, Year" to match the original format
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const weekLabel = document.getElementById('weekLabel');
    if (weekLabel && currentWeekStart) {
        weekLabel.textContent =
            'Week of ' + currentWeekStart.toLocaleDateString('en-US', options);
    }
}

// Prev/Next week event listeners
const prevWeekBtn = document.getElementById('btnPrevWeek');
if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        MagnateData.currentWeekStart = currentWeekStart;
        MagnateData.saveData();
        updateAnalytics();
    });
}

const nextWeekBtn = document.getElementById('btnNextWeek');
if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        MagnateData.currentWeekStart = currentWeekStart;
        MagnateData.saveData();
        updateAnalytics();
    });
}

/* Overall Analytics Logic */
/**
 * Update all analytics displays
 */
function updateAnalytics() {
    if (!currentWeekStart) return;

    let year = currentWeekStart.getFullYear();
    let month = currentWeekStart.getMonth();
    let firstDay = new Date(year, month, 1);
    let nextMonth = new Date(year, month + 1, 1);
    let startStrMonth = firstDay.toISOString().slice(0, 10);
    let endStrMonth = nextMonth.toISOString().slice(0, 10);

    let monthlyExpenses = [];
    if (Array.isArray(MagnateData.expenses)) {
        monthlyExpenses = MagnateData.expenses.filter(exp => {
            if (!exp.date) return false;
            return MagnateUtils.isDateBetween(exp.date, startStrMonth, endStrMonth) &&
                MagnateUtils.normalizeDateFormat(exp.date) < endStrMonth; // Exclude end date
        });
    }
    let totalMonthlyExpenses = monthlyExpenses.reduce(
        (sum, exp) => sum + Math.abs(exp.amount),
        0
    );

    // Use MagnateData instead of direct localStorage access
    let key = year + '-' + ("0" + (month + 1)).slice(-2);
    let totalBudget = MagnateData.monthlyBudgets[key] || 1000;

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
    MagnateData.saveData();
}

/* Weekly Chart */
let weeklyChart;
/**
 * Render the weekly chart using Chart.js
 */
function renderWeeklyChart() {
    if (!currentWeekStart) return;

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
        // Format as day abbreviations (Mon, Tue, etc.)
        labels.push(dt.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    let expenseData = [];
    let incomeData = [];
    let combinedData = [];

    weekDates.forEach(d => {
        let dayStr = d.toISOString().slice(0, 10);
        let expenseSum = MagnateData.expenses
            .filter(e => {
                return MagnateUtils.compareDateStrings(e.date, dayStr);
            })
            .reduce((sum, e) => sum + Math.abs(e.amount), 0);
        let incomeSum = MagnateData.incomes
            .filter(i => {
                return MagnateUtils.compareDateStrings(i.date, dayStr);
            })
            .reduce((sum, i) => sum + Math.abs(i.amount), 0);

        expenseData.push(expenseSum);
        incomeData.push(incomeSum);
        combinedData.push(expenseSum + incomeSum);
    });

    let maxCombined = Math.max(...combinedData);
    let remainder = maxCombined % 10;
    let globalMax = remainder !== 0 ? maxCombined + (10 - remainder) : maxCombined;
    if (globalMax === 0) globalMax = 10;

    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    const chartCtx = ctx.getContext('2d');
    if (weeklyChart) weeklyChart.destroy();

    weeklyChart = new Chart(chartCtx, {
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
                legend: {
                    display: true,
                    labels: {
                        color: '#9E9E9E'
                    }
                }
            }
        }
    });
}

/* Weekly Category Cards */
/**
 * Update the weekly category cards display
 */
function updateCategoryCards() {
    const container = document.getElementById('categoriesCards');
    if (!container) return;
    container.innerHTML = '';

    if (!currentWeekStart) return;

    let mondayStr = currentWeekStart.toISOString().slice(0, 10);
    let weekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    let weekEndStr = weekEnd.toISOString().slice(0, 10);

    // Determine the current month key based on currentWeekStart
    let year = currentWeekStart.getFullYear();
    let month = currentWeekStart.getMonth();
    let monthKey = year + '-' + ('0' + (month + 1)).slice(-2);

    if (categoryView === 'spending') {
        let expenseGroups = {};

        if (Array.isArray(MagnateData.expenses)) {
            MagnateData.expenses
                .filter(e => {
                    if (!e.date) return false;
                    return MagnateUtils.isDateBetween(e.date, mondayStr, weekEndStr);
                })
                .forEach(e => {
                    let catName = (e.category || "Uncategorized").trim();
                    let key = catName.toLowerCase();
                    let catObj = null;
                    if (Array.isArray(MagnateData.categories)) {
                        catObj = MagnateData.categories.find(c => c.name && c.name.trim().toLowerCase() === key);
                    }
                    let catBudget = 0;
                    if (catObj) {
                        const catIdStr = String(catObj.id);
                        // Check if MagnateData.categoryBudgets[monthKey] exists before accessing it
                        if (MagnateData.categoryBudgets && MagnateData.categoryBudgets[monthKey] && MagnateData.categoryBudgets[monthKey][catIdStr] !== undefined) {
                            catBudget = MagnateData.categoryBudgets[monthKey][catIdStr];
                        } else {
                            catBudget = catObj.budget || 0;
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
                    exceededLabel.style.color = '#F8969E';
                    exceededLabel.style.fontSize = '0.9rem';
                    card.appendChild(exceededLabel);
                }

                let breakdown = document.createElement('div');
                breakdown.className = 'expense-category-breakdown';
                breakdown.innerHTML = `
         <span class="percentage" style="color: ${color};">
           ${Math.round(percentage)}%
         </span>
         (${totalAmount.toFixed(2)}/${budget})
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
    } else {
        // Weekly Income by Category
        let incomeGroups = {};
        if (Array.isArray(MagnateData.incomes)) {
            MagnateData.incomes
                .filter(i => {
                    if (!i.date) return false;
                    return MagnateUtils.isDateBetween(i.date, mondayStr, weekEndStr);
                })
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
                let percentage = 100; // For income, we'll show 100% as it's the total
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
         (${group.total.toFixed(2)})
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
}

/* Monthly Category Cards */
/**
 * Update the monthly category cards display
 */
function updateMonthlyCategoryCards() {
    const container = document.getElementById('monthlyCategoryCards');
    if (!container) return;
    container.innerHTML = '';

    if (!currentWeekStart) return;

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

        if (Array.isArray(MagnateData.expenses)) {
            MagnateData.expenses
                .filter(e => {
                    if (!e.date) return false;
                    return MagnateUtils.isDateBetween(e.date, startDate, endDate) &&
                        MagnateUtils.normalizeDateFormat(e.date) < endDate; // Exclude end date
                })
                .forEach(e => {
                    let catName = (e.category || "Uncategorized").trim();
                    let key = catName.toLowerCase();
                    let catObj = null;
                    if (Array.isArray(MagnateData.categories)) {
                        catObj = MagnateData.categories.find(c => c.name && c.name.trim().toLowerCase() === key);
                    }
                    let catBudget = 0;
                    if (catObj) {
                        const catIdStr = String(catObj.id);
                        // Check if categoryBudgets[monthKey] exists before accessing it
                        if (MagnateData.categoryBudgets && MagnateData.categoryBudgets[monthKey] && MagnateData.categoryBudgets[monthKey][catIdStr] !== undefined) {
                            catBudget = MagnateData.categoryBudgets[monthKey][catIdStr];
                        } else {
                            catBudget = catObj.budget || 0;
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
                    exceededLabel.style.color = '#F8969E';
                    exceededLabel.style.fontSize = '0.9rem';
                    card.appendChild(exceededLabel);
                }

                let breakdown = document.createElement('div');
                breakdown.className = 'expense-category-breakdown';
                breakdown.innerHTML = `
         <span class="percentage" style="color: ${color};">
           ${Math.round(percentage)}%
         </span>
         (${totalAmount.toFixed(2)}/${budget})
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
    } else {
        // Monthly Income by Category
        let incomeGroups = {};
        if (Array.isArray(MagnateData.incomes)) {
            MagnateData.incomes
                .filter(i => {
                    if (!i.date) return false;
                    return MagnateUtils.isDateBetween(i.date, startDate, endDate) &&
                        MagnateUtils.normalizeDateFormat(i.date) < endDate; // Exclude end date
                })
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
                let percentage = 100; // For income, we'll show 100% as it's the total
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
         (${group.total.toFixed(2)})
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
}

if (currentWeekStart) {
    updateAnalytics();
}