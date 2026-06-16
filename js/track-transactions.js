(function () {
  'use strict';

  let lm = MagnateUtils.createListenerManager();

  let categories = MagnateData.categories;
  let expenses = MagnateData.expenses;
  let incomes = MagnateData.incomes;
  let currentWeekStart = MagnateData.currentWeekStart;

  let COLOR_EXPENSE = '#F87171';
  let COLOR_SUCCESS = '#34D399';

  document.addEventListener('DOMContentLoaded', function () {
    const style = getComputedStyle(document.documentElement);
    COLOR_EXPENSE = style.getPropertyValue('--color-expense').trim() || COLOR_EXPENSE;
    COLOR_SUCCESS = style.getPropertyValue('--color-success').trim() || COLOR_SUCCESS;
  });

  function updateWeekHeading() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('weekHeading').textContent = "Week of " + currentWeekStart.toLocaleDateString('en-US', options);
  }

  function getWeekTransactions(date) {
    const { normalizedStart, normalizedEnd } = MagnateUtils.getWeekDateRange(date);

    return {
      expenses: MagnateData._filterTransactionsByDate(expenses, normalizedStart, normalizedEnd),
      incomes: MagnateData._filterTransactionsByDate(incomes, normalizedStart, normalizedEnd)
    };
  }

  function renderTransactions() {
    const expensesColumn = document.getElementById('expensesColumn');
    const incomeColumn = document.getElementById('incomeColumn');
    expensesColumn.innerHTML = '<h2>Expenses</h2>';
    incomeColumn.innerHTML = '<h2>Income</h2>';
    lm.clearDetached();

    const weekTransactions = getWeekTransactions(currentWeekStart);

    weekTransactions.expenses.forEach(item => {
      const card = createTransactionCard(item, 'expense');
      expensesColumn.appendChild(card);
    });
    weekTransactions.incomes.forEach(item => {
      const card = createTransactionCard(item, 'income');
      incomeColumn.appendChild(card);
    });
  }

  function createTransactionCard(item, type) {
    const card = document.createElement('div');
    card.className = 'transaction-card';

    const leftDiv = document.createElement('div');
    leftDiv.className = 'transaction-left';
    const title = document.createElement('h3');
    title.textContent = item.title;

    const catObj = MagnateData.getCategoryByName(item.category);
    const categoryElem = document.createElement('p');
    categoryElem.textContent = catObj ? catObj.name : item.category;

    const dateElem = document.createElement('p');
    dateElem.className = 'transaction-date';

    let displayDate = item.date;
    if (item.date.includes("-")) {
      displayDate = MagnateUtils.convertToUSFormat(item.date);
    }
    dateElem.textContent = "Date: " + displayDate;

    leftDiv.appendChild(title);
    leftDiv.appendChild(categoryElem);
    leftDiv.appendChild(dateElem);

    const rightDiv = document.createElement('div');
    rightDiv.className = 'transaction-right-row';
    const amountSpan = document.createElement('span');
    amountSpan.className = 'transaction-amount';
    const absAmount = Math.abs(item.amount);
    amountSpan.textContent = (item.amount < 0 ? '-' : '+') + '$' + MagnateUtils.formatNumber(absAmount.toFixed(2));
    amountSpan.classList.add(item.amount < 0 ? 'negative' : 'positive');
    rightDiv.appendChild(amountSpan);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'transaction-actions';

    const editBtn = document.createElement('div');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = MagnateUtils.SVG_EDIT_ICON;
    lm.add(editBtn, 'click', () => editTransaction(item.id, type));
    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'icon-btn';
    deleteBtn.innerHTML = MagnateUtils.SVG_DELETE_ICON;
    lm.add(deleteBtn, 'click', () => deleteTransaction(item.id, type));
    actionsDiv.appendChild(deleteBtn);

    rightDiv.appendChild(actionsDiv);
    card.appendChild(leftDiv);
    card.appendChild(rightDiv);
    return card;
  }

  async function editTransaction(id, type) {
    let list = type === 'expense' ? expenses : incomes;
    let item = list.find(t => t.id === id);
    if (!item) return;

    let hasChanges = false;

    let newTitle = await MagnateUI.prompt("Edit title:", item.title);
    if (newTitle === null) { if (hasChanges) saveAndRefresh(); return; }
    newTitle = newTitle.trim();
    if (newTitle === "") {
      await MagnateUI.alert("Title cannot be empty.");
      if (hasChanges) saveAndRefresh(); return;
    }
    if (newTitle !== item.title) {
      item.title = newTitle;
      hasChanges = true;
    }

    let newCategory = await MagnateUI.prompt("Edit category:", item.category);
    if (newCategory === null) { if (hasChanges) saveAndRefresh(); return; }
    newCategory = newCategory.trim();
    if (newCategory === "") {
      await MagnateUI.alert("Category cannot be empty.");
      if (hasChanges) saveAndRefresh(); return;
    }
    if (newCategory !== item.category) {
      item.category = newCategory;
      hasChanges = true;
    }

    let newAmount = await MagnateUtils.promptNumber("Edit amount (e.g., 80 for $80):");
    if (newAmount === null) { if (hasChanges) saveAndRefresh(); return; }
    if (newAmount === 0) {
      await MagnateUI.alert("Amount must be greater than zero.");
      if (hasChanges) saveAndRefresh(); return;
    }
    const amountValue = type === 'expense' ? -Math.abs(newAmount) : Math.abs(newAmount);
    if (amountValue !== item.amount) {
      item.amount = amountValue;
      hasChanges = true;
    }

    let currentDate;
    try {
      currentDate = MagnateUtils.parseLocalDateString(item.date);
    } catch (e) {
      console.warn('Invalid date in transaction item:', item.date, item);
      await MagnateUI.alert('Invalid date format in this transaction. Please edit and fix the date.');
      return;
    }
    const newDateStr = await MagnateUtils.promptDate("Edit date", currentDate);

    if (newDateStr === null) { if (hasChanges) saveAndRefresh(); return; }

    if (newDateStr !== item.date) {
      item.date = newDateStr;
      hasChanges = true;

      let newDateObj;
      try {
        newDateObj = MagnateUtils.parseLocalDateString(item.date);
      } catch (e) {
        console.warn('Invalid date in transaction item:', item.date, item);
        await MagnateUI.alert('Invalid date format in this transaction.');
        return;
      }
      updateWeekAndUI(newDateObj);
    }

    if (hasChanges) saveAndRefresh();
  }

  async function deleteTransaction(id, type) {
    const confirmed = await MagnateUI.confirm("Are you sure you want to delete this transaction?");
    if (confirmed) {
      if (type === 'expense') {
        MagnateData.expenses = MagnateData.expenses.filter(t => t.id !== id);
        expenses = MagnateData.expenses;
      } else {
        MagnateData.incomes = MagnateData.incomes.filter(t => t.id !== id);
        incomes = MagnateData.incomes;
      }
      saveAndRefresh();
    }
  }

  lm.add(document.getElementById('prevWeekBtn'), 'click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    currentWeekStart.setHours(0, 0, 0, 0);
    MagnateData.currentWeekStart = currentWeekStart;
    updateWeekHeading();
    saveAndRefresh();
  });

  lm.add(document.getElementById('nextWeekBtn'), 'click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    currentWeekStart.setHours(0, 0, 0, 0);
    MagnateData.currentWeekStart = currentWeekStart;
    updateWeekHeading();
    saveAndRefresh();
  });

  function updateWeekAndUI(newDateObj) {
    const newWeekStart = MagnateUtils.getMonday(newDateObj);
    if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
      newWeekStart.setHours(0, 0, 0, 0);
      currentWeekStart = newWeekStart;
      MagnateData.currentWeekStart = currentWeekStart;
      updateWeekHeading();
    }
  }

  function saveAndRefresh() {
    MagnateData.saveData();
    renderTransactions();
    renderTransactionGroups();
  }

  updateWeekHeading();

  async function addTransaction(type) {
    const label = type === 'expense' ? 'expense' : 'income';
    const title = await MagnateUI.prompt("Enter " + label + " title:");
    if (!title) return;
    const category = await MagnateUI.prompt("Enter " + label + " category:");
    let amount = await MagnateUtils.promptNumber("Enter " + label + " amount (e.g., 80 for $80):");
    if (amount === null) return;
    const date = await MagnateUtils.promptDate("Enter " + label + " date", new Date());

    let newDateObj;
    try {
      newDateObj = MagnateUtils.parseLocalDateString(date);
    } catch (e) {
      console.warn('Invalid date in new ' + label + ':', date);
      await MagnateUI.alert('Invalid date format in the new ' + label + '.');
      return;
    }

    updateWeekAndUI(newDateObj);

    const sign = type === 'expense' ? -1 : 1;
    const newTransaction = {
      id: MagnateUtils.generateId(),
      title: title.trim(),
      category: category ? category.trim() : "",
      amount: sign * Math.abs(amount),
      date: date
    };
    if (type === 'expense') {
      MagnateData.expenses.push(newTransaction);
      expenses = MagnateData.expenses;
    } else {
      MagnateData.incomes.push(newTransaction);
      incomes = MagnateData.incomes;
    }

    saveAndRefresh();
  }

  lm.add(document.getElementById('btnAddExpense'), 'click', () => addTransaction('expense'));
  lm.add(document.getElementById('btnAddIncome'), 'click', () => addTransaction('income'));

  function renderTransactionGroups() {
    const expenseContainer = document.getElementById('expenseGroupsContainer');
    const incomeContainer = document.getElementById('incomeGroupsContainer');
    expenseContainer.innerHTML = "";
    incomeContainer.innerHTML = "";

    const groups = MagnateData.getTransactionGroups();

    function buildGroupCard(category, transactions, total, typeLabel) {
      const card = document.createElement('div');
      card.className = 'transaction-group-card';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'transaction-group-header';

      const titleDiv = document.createElement('div');
      titleDiv.className = 'transaction-group-title';
      titleDiv.textContent = category;
      headerDiv.appendChild(titleDiv);

      let budgetDiv = null;
      const categoryObj = MagnateData.getCategoryByName(category);
      if (categoryObj) {
        const monthKey = MagnateUtils.getMonthKey(currentWeekStart);
        let budgetAmount = 0;
        if (MagnateData.categoryBudgets &&
          MagnateData.categoryBudgets[monthKey] &&
          MagnateData.categoryBudgets[monthKey][String(categoryObj.id)] !== undefined) {
          budgetAmount = MagnateData.categoryBudgets[monthKey][String(categoryObj.id)];
        } else {
          budgetAmount = categoryObj.budget || 0;
        }
        if (budgetAmount > 0) {
          budgetDiv = document.createElement('div');
          budgetDiv.className = 'transaction-group-budget';
          budgetDiv.textContent = `Budget: $${MagnateUtils.formatNumber(budgetAmount.toFixed(2))}`;
        }
      }
      if (budgetDiv) headerDiv.appendChild(budgetDiv);
      card.appendChild(headerDiv);

      const totalDiv = document.createElement('div');
      totalDiv.className = 'transaction-group-total';
      const prefix = typeLabel === 'expense' ? '-' : '+';
      const color = typeLabel === 'expense' ? COLOR_EXPENSE : COLOR_SUCCESS;
      totalDiv.textContent = `Total: ${prefix}$${MagnateUtils.formatNumber(Math.abs(total).toFixed(2))}`;
      totalDiv.style.color = color;
      card.appendChild(totalDiv);

      transactions.forEach(txn => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'transaction-item';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'transaction-item-title';
        titleSpan.textContent = txn.title;
        itemDiv.appendChild(titleSpan);

        const amountSpan = document.createElement('span');
        amountSpan.className = 'transaction-item-amount ' + typeLabel;
        amountSpan.textContent = prefix + '$' + MagnateUtils.formatNumber(Math.abs(txn.amount).toFixed(2));
        itemDiv.appendChild(amountSpan);

        card.appendChild(itemDiv);
      });

      return card;
    }

    groups.forEach(group => {
      if (group.expenses.length > 0) {
        const totalExpenses = group.expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
        expenseContainer.appendChild(buildGroupCard(group.category, group.expenses, totalExpenses, 'expense'));
      }
      if (group.incomes.length > 0) {
        const totalIncomes = group.incomes.reduce((sum, i) => sum + Math.abs(i.amount), 0);
        incomeContainer.appendChild(buildGroupCard(group.category, group.incomes, totalIncomes, 'income'));
      }
    });
  }

  let easyMDE;

  function initNotes() {
    const notes = MagnateData.notes || '';

    easyMDE = new EasyMDE({
      element: document.getElementById("notesTextarea"),
      initialValue: notes,
      placeholder: "# Markdown Support\n\n## Formatting\n- **Bold** text with double asterisks\n- *Italic* text with single asterisks\n\n## Headers\n- # Header 1\n- ## Header 2\n- ### Header 3\n- #### Header 4\n- ##### Header 5\n- ###### Header 6\n\n## Lists\n- Bullet points with asterisks\n  * First item\n  * Second item\n  * Third item\n- Numbered lists with numbers\n  1. First item\n  2. Second item\n  3. Third item\n\n## Media Elements\n- [Link Text](https://) to create links\n- ![Image](https://) to insert images\n \n \n",
      autosave: {
        enabled: true,
        uniqueId: "magnate-notes",
        delay: 1000,
      },
      autofocus: false,
      spellChecker: true,
      inputStyle: "contenteditable",
      nativeSpellcheck: true,
      sideBySideFullscreen: false,
      status: ["autosave", "lines", "words"],
      toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"],
    });

    easyMDE.codemirror.on("change", function () {
      MagnateData.notes = easyMDE.value();
      MagnateData.saveData();
    });
  }

  const visibilityHandler = function () {
    if (!document.hidden) {
      MagnateData.loadData();
      categories = MagnateData.categories;
      expenses = MagnateData.expenses;
      incomes = MagnateData.incomes;
      currentWeekStart = MagnateData.currentWeekStart;
      updateWeekHeading();
      renderTransactions();
      renderTransactionGroups();
    }
  };

  saveAndRefresh();
  initNotes();

  document.addEventListener('visibilitychange', visibilityHandler);

  window.addEventListener('beforeunload', function () {
    lm.cleanup();
    document.removeEventListener('visibilitychange', visibilityHandler);
    if (easyMDE) {
      easyMDE.toTextArea();
      easyMDE = null;
    }
  });
})();