// Use centralized data management for all data access
let categories = MagnateData.categories;
let expenses = MagnateData.expenses;
let incomes = MagnateData.incomes;
let currentWeekStart = MagnateData.currentWeekStart;

// Ensure currentWeekStart is properly initialized from MagnateData
if (!currentWeekStart) {
  currentWeekStart = MagnateData.currentWeekStart = new Date();
  // Ensure the date is at the start of the day to avoid timezone issues
  currentWeekStart.setHours(0, 0, 0, 0);
}

function updateWeekHeading() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('weekHeading').textContent = "Week of " + currentWeekStart.toLocaleDateString('en-US', options);
}

function getWeekTransactions(date) {
  let startStr = MagnateUtils.getLocalDateString(date);
  let weekEndDate = new Date(date);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  let endStr = MagnateUtils.getLocalDateString(weekEndDate);

  // Helper function to filter transactions by date range
  const filterForWeek = (transactionList) => {
    return transactionList.filter(item => {
      try {
        let itemDateLocal = MagnateUtils.getLocalDateString(MagnateUtils.parseLocalDateString(item.date));
        return itemDateLocal >= startStr && itemDateLocal <= endStr;
      } catch (e) {
        console.warn('Invalid date in transaction item:', item.date, item);
        return false;
      }
    });
  };

  return {
    expenses: filterForWeek(expenses),
    incomes: filterForWeek(incomes)
  };
}

function renderTransactions() {
  const expensesColumn = document.getElementById('expensesColumn');
  const incomeColumn = document.getElementById('incomeColumn');
  expensesColumn.innerHTML = '<h2>Expenses</h2>';
  incomeColumn.innerHTML = '<h2>Income</h2>';

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

  // Display the stored date string directly to avoid timezone conversion issues
  // Format it nicely for display
  let displayDate = item.date;
  if (item.date.includes("-")) {
    // Convert YYYY-MM-DD to MM/DD/YYYY for consistent display
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
  amountSpan.textContent = (item.amount < 0 ? '-' : '+') + '$' + Math.abs(item.amount).toFixed(2);
  amountSpan.classList.add(item.amount < 0 ? 'negative' : 'positive');
  rightDiv.appendChild(amountSpan);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'transaction-actions';

  const editBtn = document.createElement('div');
  editBtn.className = 'icon-btn';
  editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="display: block; margin: auto; position: relative; top: 2px; left: 3px;">
  <path d="M2.66795 14.6297L13.3222 3.98517L11.6133 2.26642L0.949202 12.911L0.021468 15.0887C-0.0761882 15.3231 0.177718 15.5965 0.412093 15.4988ZM14.1816 3.14533L15.168 2.17853C15.666 1.68048 15.6953 1.14338 15.2461 0.694157L14.914 0.362125C14.4746-0.0773278 13.9375-0.0382653 13.4394 0.450016L12.4531 1.42658Z" fill="white" fill-opacity="0.85"/>
</svg>`;
  editBtn.addEventListener('click', () => editTransaction(item.id, type));
  actionsDiv.appendChild(editBtn);

  const deleteBtn = document.createElement('div');
  deleteBtn.className = 'icon-btn';
  deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="position: relative; left: 1.5px; top: 0px;">
  <path d="M6.5625 18.6035C6.93359 18.6035 7.17773 18.3691 7.16797 18.0273L6.86523 7.57812C6.85547 7.23633 6.61133 7.01172 6.25977 7.01172C5.88867 7.01172 5.64453 7.24609 5.6543 7.58789L5.94727 18.0273C5.95703 18.3789 6.20117 18.6035 6.5625 18.6035ZM9.45312 18.6035C9.82422 18.6035 10.0879 18.3691 10.0879 18.0273L10.0879 7.58789C10.0879 7.24609 9.82422 7.01172 9.45312 7.01172C9.08203 7.01172 8.82812 7.24609 8.82812 7.58789L8.82812 18.0273C8.82812 18.3691 9.08203 18.6035 9.45312 18.6035ZM12.3535 18.6035C12.7051 18.6035 12.9492 18.3789 12.959 18.0273L13.252 7.58789C13.2617 7.24609 13.0176 7.01172 12.6465 7.01172C12.2949 7.01172 12.0508 7.23633 12.041 7.58789L11.748 18.0273C11.7383 18.3691 11.9824 18.6035 12.3535 18.6035ZM5.16602 4.46289L6.71875 4.46289L6.71875 2.37305C6.71875 1.81641 7.10938 1.45508 7.69531 1.45508L11.1914 1.45508C11.7773 1.45508 12.168 1.81641 12.168 2.37305L12.168 4.46289L13.7207 4.46289L13.7207 2.27539C13.7207 0.859375 12.8027 0 11.2988 0L7.58789 0C6.08398 0 5.16602 0.859375 5.16602 2.27539ZM0.732422 5.24414L18.1836 5.24414C18.584 5.24414 18.9062 4.90234 18.9062 4.50195C18.9062 4.10156 18.584 3.76953 18.1836 3.76953L0.732422 3.76953C0.341797 3.76953 0 4.10156 0 4.50195C0 4.91211 0.341797 5.24414 0.732422 5.24414ZM4.98047 21.748L13.9355 21.748C15.332 21.748 16.2695 20.8398 16.3379 19.4434L17.0215 5.05859L15.4492 5.05859L14.7949 19.2773C14.7754 19.8633 14.3555 20.2734 13.7793 20.2734L5.11719 20.2734C4.56055 20.2734 4.14062 19.8535 4.11133 19.2773L3.41797 5.05859L1.88477 5.05859L2.57812 19.4531C2.64648 20.8496 3.56445 21.748 4.98047 21.748Z" fill="white" fill-opacity="0.85"/>
</svg>`;
  deleteBtn.addEventListener('click', () => deleteTransaction(item.id, type));
  actionsDiv.appendChild(deleteBtn);

  rightDiv.appendChild(actionsDiv);
  card.appendChild(leftDiv);
  card.appendChild(rightDiv);
  return card;
}

function editTransaction(id, type) {
  let list = type === 'expense' ? expenses : incomes;
  let item = list.find(t => t.id === id);
  if (item) {
    let hasChanges = false;

    let newTitle = prompt("Edit title:", item.title);
    if (newTitle === null) {
      // User cancelled, but we might have previous changes to save
      if (hasChanges) {
        saveAndRefresh();
      }
      return;
    }
    newTitle = newTitle.trim();
    if (newTitle === "") {
      alert("Title cannot be empty.");
      // If we have previous changes, save them
      if (hasChanges) {
        saveAndRefresh();
      }
      return;
    }
    if (newTitle !== item.title) {
      item.title = newTitle;
      hasChanges = true;
    }

    let newCategory = prompt("Edit category:", item.category);
    if (newCategory === null) {
      // User cancelled, but we might have previous changes to save
      if (hasChanges) {
        saveAndRefresh();
      }
      return;
    }
    newCategory = newCategory.trim();
    if (newCategory === "") {
      alert("Category cannot be empty.");
      // If we have previous changes, save them
      if (hasChanges) {
        saveAndRefresh();
      }
      return;
    }
    if (newCategory !== item.category) {
      item.category = newCategory;
      hasChanges = true;
    }

    let newAmount = MagnateUtils.promptNumber("Edit amount (e.g., 80 for $80):");
    if (newAmount === null) {
      // User cancelled, but we might have previous changes to save
      if (hasChanges) {
        saveAndRefresh();
      }
      return;
    }
    // Validate amount is not zero
    if (newAmount === 0) {
      alert("Amount must be greater than zero.");
      // Even if there was an error, save any previous valid changes
      if (hasChanges) {
        saveAndRefresh();
      }
      return;
    }
    const amountValue = type === 'expense' ? -Math.abs(newAmount) : Math.abs(newAmount);
    if (amountValue !== item.amount) {
      item.amount = amountValue;
      hasChanges = true;
    }

    // Date editing with validation
    // Create a Date object from the stored date string for the prompt
    let currentDate;
    try {
      currentDate = MagnateUtils.parseLocalDateString(item.date);
    } catch (e) {
      console.warn('Invalid date in transaction item:', item.date, item);
      alert('Invalid date format in this transaction. Please edit and fix the date.');
      return;
    }
    const newDateStr = MagnateUtils.promptDate("Edit date", currentDate);

    // If user cancelled the prompt
    if (newDateStr === null) {
      // User cancelled, but we might have previous changes to save
      if (hasChanges) {
        saveAndRefresh();
      }
      return;
    }

    // Only update if date actually changed
    if (newDateStr !== item.date) {
      item.date = newDateStr;  // Store the original date string format
      hasChanges = true;

      // Update week if needed
      let newDateObj;
      try {
        newDateObj = MagnateUtils.parseLocalDateString(item.date);
      } catch (e) {
        console.warn('Invalid date in transaction item:', item.date, item);
        alert('Invalid date format in this transaction.');
        return;
      }
      updateWeekAndUI(newDateObj);
    }

    // If we have changes, update the UI and save data
    if (hasChanges) {
      saveAndRefresh();
    }
  }
}

function deleteTransaction(id, type) {
  if (confirm("Are you sure you want to delete this transaction?")) {
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

document.getElementById('prevWeekBtn')?.addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  // Ensure the date is at the start of the day to avoid timezone issues
  currentWeekStart.setHours(0, 0, 0, 0);
  MagnateData.currentWeekStart = currentWeekStart; // Ensure global state is updated
  updateWeekHeading();
  saveAndRefresh();
});

document.getElementById('nextWeekBtn')?.addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  // Ensure the date is at the start of the day to avoid timezone issues
  currentWeekStart.setHours(0, 0, 0, 0);
  MagnateData.currentWeekStart = currentWeekStart; // Ensure global state is updated
  updateWeekHeading();
  saveAndRefresh();
});

// Helper function to handle the update of week and UI
function updateWeekAndUI(newDateObj) {
  const newWeekStart = MagnateUtils.getMonday(newDateObj);
  if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
    // Ensure the date is at the start of the day to avoid timezone issues
    newWeekStart.setHours(0, 0, 0, 0);
    currentWeekStart = newWeekStart;
    MagnateData.currentWeekStart = currentWeekStart;
    updateWeekHeading();
  }
}

// Helper function to handle the saving and rendering operations
function saveAndRefresh() {
  // Save data before rendering to ensure consistency
  MagnateData.saveData();
  renderTransactions();
  renderTransactionGroups(); // Update transaction groups
}

// Initialize week heading
updateWeekHeading();

document.getElementById('btnAddExpense')?.addEventListener('click', () => {
  const title = prompt("Enter expense title:");
  if (!title) return;
  const category = prompt("Enter expense category:");
  let amount = MagnateUtils.promptNumber("Enter expense amount (e.g., 80 for $80):");
  if (amount === null) return;
  const date = MagnateUtils.promptDate("Enter expense date", new Date());

  let newDateObj;
  try {
    newDateObj = MagnateUtils.parseLocalDateString(date);
  } catch (e) {
    console.warn('Invalid date in new expense:', date);
    alert('Invalid date format in the new expense.');
    return;
  }

  updateWeekAndUI(newDateObj);

  const newExpense = {
    id: MagnateUtils.generateId(),
    title: title.trim(),
    category: category ? category.trim() : "",
    amount: -Math.abs(amount),
    date: date  // Store the original date string format
  };
  MagnateData.expenses.push(newExpense);
  expenses = MagnateData.expenses;

  saveAndRefresh();
});

document.getElementById('btnAddIncome')?.addEventListener('click', () => {
  const title = prompt("Enter income title:");
  if (!title) return;
  const category = prompt("Enter income category:");
  let amount = MagnateUtils.promptNumber("Enter income amount (e.g., 100 for $100):");
  if (amount === null) return;
  const date = MagnateUtils.promptDate("Enter income date", new Date());

  let newDateObj;
  try {
    newDateObj = MagnateUtils.parseLocalDateString(date);
  } catch (e) {
    console.warn('Invalid date in new income:', date);
    alert('Invalid date format in the new income.');
    return;
  }

  updateWeekAndUI(newDateObj);

  const newIncome = {
    id: MagnateUtils.generateId(),
    title: title.trim(),
    category: category ? category.trim() : "",
    amount: Math.abs(amount),
    date: date  // Store the original date string format
  };
  MagnateData.incomes.push(newIncome);
  incomes = MagnateData.incomes;

  saveAndRefresh();
});

function renderTransactionGroups() {
  const container = document.getElementById('transactionGroupsContainer');
  container.innerHTML = "";

  // Refresh the local references to ensure we have the latest data
  expenses = MagnateData.expenses;
  incomes = MagnateData.incomes;

  // Use the centralized version from MagnateData
  const groups = MagnateData.getTransactionGroups();

  groups.forEach(group => {
    const card = document.createElement('div');
    card.className = 'transaction-group-card';

    // Create a header row with category title on left and budget on right
    const headerDiv = document.createElement('div');
    headerDiv.className = 'transaction-group-header';
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '0.75rem';
    headerDiv.style.borderBottom = '1px solid #2D2F34';
    headerDiv.style.paddingBottom = '0.5rem';

    // Group title (category name)
    const titleDiv = document.createElement('div');
    titleDiv.className = 'transaction-group-title';
    titleDiv.textContent = group.category;
    titleDiv.style.marginBottom = '0';
    titleDiv.style.fontSize = '1.1rem';

    // Check if there's a budget for this category
    let budgetDiv = null;
    const categoryObj = MagnateData.getCategoryByName(group.category);
    if (categoryObj) {
      // Get the current month key to check for monthly budget
      const monthKey = currentWeekStart.getFullYear() + '-' + ("0" + (currentWeekStart.getMonth() + 1)).slice(-2);
      let budgetAmount = 0;

      // Check if there's a specific budget set for this month and category
      if (MagnateData.categoryBudgets &&
        MagnateData.categoryBudgets[monthKey] &&
        MagnateData.categoryBudgets[monthKey][String(categoryObj.id)] !== undefined) {
        budgetAmount = MagnateData.categoryBudgets[monthKey][String(categoryObj.id)];
      } else {
        // Fall back to the default budget from the category object
        budgetAmount = categoryObj.budget || 0;
      }

      if (budgetAmount > 0) {
        budgetDiv = document.createElement('div');
        budgetDiv.className = 'transaction-group-budget';
        budgetDiv.textContent = `Budget: $${budgetAmount.toFixed(2)}`;
        budgetDiv.style.fontSize = '0.9rem';
        budgetDiv.style.color = '#A3A3A3';
        budgetDiv.style.fontWeight = '500';
      }
    }

    headerDiv.appendChild(titleDiv);
    if (budgetDiv) {
      headerDiv.appendChild(budgetDiv);
    }
    card.appendChild(headerDiv);

    // Total for this category
    const totalDiv = document.createElement('div');
    totalDiv.className = 'transaction-group-total';

    // Color code the total based on value
    if (group.total > 0) {
      totalDiv.textContent = `Net: +$${group.total.toFixed(2)}`;
      totalDiv.style.color = '#34D399'; // Green for positive
    } else if (group.total < 0) {
      totalDiv.textContent = `Net: -$${Math.abs(group.total).toFixed(2)}`;
      totalDiv.style.color = '#F87171'; // Red for negative
    } else {
      totalDiv.textContent = `Net: $${group.total.toFixed(2)}`;
      totalDiv.style.color = '#CCCCCC'; // Gray for zero
    }

    card.appendChild(totalDiv);

    // Add expenses for this category
    group.expenses.forEach(expense => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'transaction-item';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'transaction-item-title';
      titleSpan.textContent = expense.title;
      itemDiv.appendChild(titleSpan);

      const amountSpan = document.createElement('span');
      amountSpan.className = 'transaction-item-amount expense';
      amountSpan.textContent = `-$${Math.abs(expense.amount).toFixed(2)}`;
      itemDiv.appendChild(amountSpan);

      card.appendChild(itemDiv);
    });

    // Add incomes for this category
    group.incomes.forEach(income => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'transaction-item';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'transaction-item-title';
      titleSpan.textContent = income.title;
      itemDiv.appendChild(titleSpan);

      const amountSpan = document.createElement('span');
      amountSpan.className = 'transaction-item-amount income';
      amountSpan.textContent = `+$${Math.abs(income.amount).toFixed(2)}`;
      itemDiv.appendChild(amountSpan);

      card.appendChild(itemDiv);
    });

    container.appendChild(card);
  });
}

// Initialize EasyMDE editor
let easyMDE;

function initNotes() {
  // Load notes from MagnateData
  const notes = MagnateData.notes || '';

  // Initialize EasyMDE on the textarea with simplified configuration
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
    status: ["autosave", "lines", "words"], // Enable status bar with autosave, lines, and words
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"],
  });

  // Add event listener for changes to save to MagnateData
  easyMDE.codemirror.on("change", function () {
    MagnateData.notes = easyMDE.value();
    MagnateData.saveData();
  });
}

// Initial transactions section
saveAndRefresh();

// Initialize notes section
initNotes();

// Refresh data when page becomes visible (e.g., after import in Analytics.html)
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) {
    // Refresh data to ensure consistency before rendering transaction groups
    MagnateData.loadData();
    // Update currentWeekStart to ensure it's in sync with MagnateData
    currentWeekStart = MagnateData.currentWeekStart;
    renderTransactionGroups();
  }
});