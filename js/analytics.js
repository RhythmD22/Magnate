(function () {
  'use strict';

  let lm = MagnateUtils.createListenerManager();

  let categoryView = 'spending';
  let monthlyCategoryView = 'spending';
  let currentWeekStart = MagnateData.currentWeekStart;

  const styles = getComputedStyle(document.documentElement);
  const colorExpense = styles.getPropertyValue('--color-expense').trim() || '#F87171';
  const colorSuccess = styles.getPropertyValue('--color-success').trim() || '#34D399';
  const colorTextMuted = styles.getPropertyValue('--color-text-muted').trim() || '#A5A5A5';
  const colorBorderHover = styles.getPropertyValue('--color-border-hover').trim() || '#3A3D42';
  const colorTextPrimary = styles.getPropertyValue('--color-text-primary').trim() || '#FFFFFF';

  function updateWeekLabel() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const weekLabel = document.getElementById('weekLabel');
    if (weekLabel && currentWeekStart) {
      weekLabel.textContent =
        'Week of ' + currentWeekStart.toLocaleDateString('en-US', options);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggleCategoryViewBtn = document.getElementById('toggleCategoryView');
    if (toggleCategoryViewBtn) {
      const updateToggleBtn = () => {
        toggleCategoryViewBtn.textContent = categoryView === 'spending' ? 'Show Income' : 'Show Spending';
      };
      updateToggleBtn();
      lm.add(toggleCategoryViewBtn, 'click', () => {
        categoryView = (categoryView === 'spending') ? 'income' : 'spending';
        const categoryCardTitle = document.getElementById('categoryCardTitle');
        if (categoryCardTitle) {
          categoryCardTitle.textContent =
            (categoryView === 'spending') ? 'Weekly Spending by Category:' : 'Weekly Income by Category:';
        }
        updateToggleBtn();
        updateCategoryCards();
      });
    }

    const toggleMonthlyViewBtn = document.getElementById('toggleMonthlyView');
    if (toggleMonthlyViewBtn) {
      const updateMonthlyToggleBtn = () => {
        toggleMonthlyViewBtn.textContent = monthlyCategoryView === 'spending' ? 'Show Income' : 'Show Spending';
      };
      updateMonthlyToggleBtn();
      lm.add(toggleMonthlyViewBtn, 'click', () => {
        monthlyCategoryView = (monthlyCategoryView === 'spending') ? 'income' : 'spending';
        const monthlyCardTitle = document.getElementById('monthlyCardTitle');
        if (monthlyCardTitle) {
          monthlyCardTitle.textContent =
            (monthlyCategoryView === 'spending') ? 'Monthly Spending by Category:' : 'Monthly Income by Category:';
        }
        updateMonthlyToggleBtn();
        updateMonthlyCategoryCards();
      });
    }

    const prevWeekBtn = document.getElementById('btnPrevWeek');
    if (prevWeekBtn) {
      lm.add(prevWeekBtn, 'click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        MagnateData.currentWeekStart = currentWeekStart;
        MagnateData.saveData();
        updateAnalytics();
      });
    }

    const nextWeekBtn = document.getElementById('btnNextWeek');
    if (nextWeekBtn) {
      lm.add(nextWeekBtn, 'click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        MagnateData.currentWeekStart = currentWeekStart;
        MagnateData.saveData();
        updateAnalytics();
      });
    }

    if (currentWeekStart) {
      updateAnalytics();
    }
  });

  function updateAnalytics() {
    if (!currentWeekStart) return;

    let year = currentWeekStart.getFullYear();
    let month = currentWeekStart.getMonth();
    let firstDay = new Date(year, month, 1);
    let lastDay = new Date(year, month + 1, 0);
    let startStrMonth = MagnateUtils.normalizeDateFormat(MagnateUtils.getLocalDateString(firstDay));
    let endStrMonth = MagnateUtils.normalizeDateFormat(MagnateUtils.getLocalDateString(lastDay));

    let monthlyExpenses = [];
    if (Array.isArray(MagnateData.expenses)) {
      monthlyExpenses = MagnateData.expenses.filter(exp => {
        if (!exp.date) return false;
        const normalized = MagnateUtils.normalizeDateFormat(exp.date);
        return normalized >= startStrMonth && normalized <= endStrMonth;
      });
    }
    let totalMonthlyExpenses = monthlyExpenses.reduce(
      (sum, exp) => sum + Math.abs(exp.amount),
      0
    );

    let monthlyIncomes = [];
    if (Array.isArray(MagnateData.incomes)) {
      monthlyIncomes = MagnateData.incomes.filter(inc => {
        if (!inc.date) return false;
        const normalized = MagnateUtils.normalizeDateFormat(inc.date);
        return normalized >= startStrMonth && normalized <= endStrMonth;
      });
    }
    let totalMonthlyIncomes = monthlyIncomes.reduce(
      (sum, inc) => sum + Math.abs(inc.amount),
      0
    );

    let netAmount = totalMonthlyIncomes - totalMonthlyExpenses;
    const netEl = document.getElementById('netAmount');
    if (netEl) {
      const netSign = netAmount >= 0 ? '+' : '-';
      netEl.textContent = netSign + '$' + MagnateUtils.formatNumber(Math.abs(netAmount));
      netEl.style.color = netAmount >= 0 ? colorSuccess : colorExpense;
    }

    const hasData = MagnateData.expenses.length > 0 || MagnateData.incomes.length > 0;
    const defaultBudget = MagnateData.monthlyBudgets[MagnateUtils.getMonthKey(firstDay)] || 1000;

    if (!hasData) {
      document.getElementById('totalBudget').textContent = '$' + MagnateUtils.formatNumber(defaultBudget);
      document.getElementById('remainingBudget').textContent = '$' + MagnateUtils.formatNumber(defaultBudget);
      document.getElementById('progressText').innerHTML = '0%<br/>Spent';
      document.getElementById('progressCircle').style.strokeDashoffset = '628';
      document.getElementById('categoriesCards').innerHTML = '<p style="text-align:center;padding:2rem 1rem;color:var(--color-text-muted);font-size:0.9rem;">Add transactions to see category breakdowns.</p>';
      document.getElementById('monthlyCategoryCards').innerHTML = '<p style="text-align:center;padding:2rem 1rem;color:var(--color-text-muted);font-size:0.9rem;">Add transactions to see monthly breakdowns.</p>';
      renderWeeklyChart();
      return;
    }

    let key = MagnateUtils.getMonthKey(firstDay);
    let totalBudget = MagnateData.monthlyBudgets[key] || 1000;

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
  }

  let weeklyChart;

  function renderWeeklyChart() {
    if (!currentWeekStart) return;

    let weekDates = [];
    let labels = [];
    for (let i = 0; i < 7; i++) {
      let dt = new Date(currentWeekStart);
      dt.setDate(dt.getDate() + i);
      weekDates.push(dt);
      labels.push(dt.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    let expenseData = [];
    let incomeData = [];
    let combinedData = [];

    weekDates.forEach(d => {
      let dayStr = MagnateUtils.normalizeDateFormat(MagnateUtils.getLocalDateString(d));
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

    let maxCombined = combinedData.length > 0 ? Math.max(...combinedData) : 0;
    let remainder = maxCombined % 10;
    let globalMax = remainder !== 0 ? maxCombined + (10 - remainder) : maxCombined;
    if (globalMax === 0) globalMax = 10;

    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    const chartCtx = ctx.getContext('2d');

    if (weeklyChart) {
      weeklyChart.data.datasets[0].data = expenseData;
      weeklyChart.data.datasets[1].data = incomeData;
      weeklyChart.options.scales.y.max = globalMax;
      weeklyChart.update();
    } else {
      weeklyChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Expenses',
              data: expenseData,
              backgroundColor: colorExpense,
              borderColor: colorExpense,
              borderWidth: 1
            },
            {
              label: 'Income',
              data: incomeData,
              backgroundColor: colorSuccess,
              borderColor: colorSuccess,
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
                color: colorTextMuted
              },
              grid: {
                color: colorBorderHover
              },
              title: {
                display: true,
                text: 'Amount ($)',
                color: colorTextPrimary,
                font: { size: 14 }
              }
            },
            x: {
              stacked: true,
              grid: { color: colorBorderHover },
              ticks: { color: colorTextMuted },
              title: {
                display: true,
                text: 'Days of the Week',
                color: colorTextPrimary,
                font: { size: 14 }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.dataset.label ? context.dataset.label + ': ' : '';
                  return label + '$' + MagnateUtils.formatNumber(context.parsed.y);
                }
              }
            },
            legend: {
              display: true,
              labels: {
                color: colorTextMuted
              }
            }
          }
        }
      });
    }
  }

  function createCategoryCard(name, total, budget = 0, color, isIncome = false) {
    let percentage = isIncome ? 100 : (budget > 0) ? (total / budget) * 100 : 0;
    percentage = Math.min(100, percentage);

    const card = document.createElement('div');
    card.className = 'expense-category-card';

    const title = document.createElement('div');
    title.className = 'expense-category-title';
    title.textContent = name;
    title.style.color = color;
    card.appendChild(title);

    if (!isIncome && total > budget) {
      const exceededLabel = document.createElement('div');
      exceededLabel.textContent = '(Exceeded)';
      exceededLabel.style.color = '#F8969E';
      exceededLabel.style.fontSize = '0.9rem';
      card.appendChild(exceededLabel);
    }

    const breakdown = document.createElement('div');
    breakdown.className = 'expense-category-breakdown';
    const prefix = isIncome ? '+' : '-';
    breakdown.innerHTML = `
          <span class="percentage" style="color: ${color};">
              ${Math.round(percentage)}%
          </span>
          (${prefix}$${MagnateUtils.formatNumber(total.toFixed(2))}${!isIncome ? '/' + MagnateUtils.formatNumber(budget.toFixed(2)) : ''})
      `;
    card.appendChild(breakdown);

    const progressBar = document.createElement('div');
    progressBar.className = 'category-progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'category-progress-fill';
    progressFill.style.width = percentage + '%';
    progressFill.style.backgroundColor = color;

    progressBar.appendChild(progressFill);
    card.appendChild(progressBar);

    return card;
  }

  function getTransactionsByDateRangeAndCategory(startDate, endDate, view) {
    if (view === 'spending') {
      const start = new Date(startDate);
      let monthKey = MagnateUtils.getMonthKey(start);

      let expenseGroups = {};

      if (Array.isArray(MagnateData.expenses)) {
        MagnateData.expenses
          .filter(e => {
            if (!e.date) return false;
            return MagnateUtils.isDateBetween(e.date, startDate, endDate);
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
      }

      return expenseGroups;
    } else {
      let incomeGroups = {};
      if (Array.isArray(MagnateData.incomes)) {
        MagnateData.incomes
          .filter(i => {
            if (!i.date) return false;
            return MagnateUtils.isDateBetween(i.date, startDate, endDate);
          })
          .forEach(i => {
            let catName = (i.category || "Uncategorized").trim();
            let key = catName.toLowerCase();
            if (!incomeGroups[key]) {
              incomeGroups[key] = { name: catName, total: 0 };
            }
            incomeGroups[key].total += Math.abs(i.amount);
          });
      }

      return incomeGroups;
    }
  }

  function updateCategoryCards() {
    const container = document.getElementById('categoriesCards');
    if (!container) return;
    container.innerHTML = '';

    if (!currentWeekStart) return;

    let mondayStr = MagnateUtils.normalizeDateFormat(MagnateUtils.getLocalDateString(currentWeekStart));
    let weekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    let weekEndStr = MagnateUtils.normalizeDateFormat(MagnateUtils.getLocalDateString(weekEnd));

    const groupedTransactions = getTransactionsByDateRangeAndCategory(mondayStr, weekEndStr, categoryView);

    const color = categoryView === 'spending' ? colorExpense : colorSuccess;
    const isIncome = categoryView === 'income';

    for (let key in groupedTransactions) {
      let group = groupedTransactions[key];
      const card = createCategoryCard(group.name, group.total, group.budget || 0, color, isIncome);
      container.appendChild(card);
    }
  }

  function updateMonthlyCategoryCards() {
    const container = document.getElementById('monthlyCategoryCards');
    if (!container) return;
    container.innerHTML = '';

    if (!currentWeekStart) return;

    let year = currentWeekStart.getFullYear();
    let month = currentWeekStart.getMonth();
    let firstDay = new Date(year, month, 1);
    let lastDay = new Date(year, month + 1, 0);
    let startDate = MagnateUtils.normalizeDateFormat(MagnateUtils.getLocalDateString(firstDay));
    let endDate = MagnateUtils.normalizeDateFormat(MagnateUtils.getLocalDateString(lastDay));

    const groupedTransactions = getTransactionsByDateRangeAndCategory(startDate, endDate, monthlyCategoryView);

    const color = monthlyCategoryView === 'spending' ? colorExpense : colorSuccess;
    const isIncome = monthlyCategoryView === 'income';

    for (let key in groupedTransactions) {
      let group = groupedTransactions[key];
      const card = createCategoryCard(group.name, group.total, group.budget || 0, color, isIncome);
      container.appendChild(card);
    }
  }

  window.addEventListener('beforeunload', function () {
    lm.cleanup();
    if (weeklyChart) {
      weeklyChart.destroy();
      weeklyChart = null;
    }
  });
})();