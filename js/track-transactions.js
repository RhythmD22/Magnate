function promptNumber(message) {
  let input;
  do {
    input = prompt(message);
    if (input === null) return null;
  } while (isNaN(parseFloat(input)) || input.trim() === "");
  return parseFloat(input);
}

function getLocalDateString(d) {
  const tempDate = new Date(d);
  tempDate.setMinutes(tempDate.getMinutes() - tempDate.getTimezoneOffset());
  return tempDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Function to format ISO date string for display in prompts
function formatDateForPrompt(isoDateString) {
  // For ISO date strings (YYYY-MM-DD), we want to display them as MM/DD/YYYY
  if (isoDateString && isoDateString.includes("-")) {
    const [year, month, day] = isoDateString.split("-");
    return `${month}/${day}/${year}`;
  }
  return isoDateString;
}

function promptDate(message, defaultDate) {
  defaultDate = defaultDate || new Date();
  let defaultString = getLocalDateString(defaultDate);
  let dateInput;

  do {
    dateInput = prompt(message + " (MM/DD/YYYY) or leave blank for " + defaultString + ":");
    if (dateInput === null) return null;
    dateInput = dateInput.trim();

    if (dateInput === "") {
      return defaultString;
    }

    // Validate MM/DD/YYYY format
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateInput)) {
      alert("Please enter a valid date in MM/DD/YYYY format.");
      continue;
    }

    // Parse and validate the date
    const [month, day, year] = dateInput.split("/");
    const dateObj = new Date(year, month - 1, day);

    // Check if the date is valid
    if (dateObj.getFullYear() != year || dateObj.getMonth() != month - 1 || dateObj.getDate() != day) {
      alert("Please enter a valid date.");
      continue;
    }

    return dateInput;

  } while (true);
}

function generateId() {
  return Date.now();
}

function saveData() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('incomes', JSON.stringify(incomes));
  localStorage.setItem('categories', JSON.stringify(categories));
}

let storedCategories = localStorage.getItem('categories');
let categories = storedCategories ? JSON.parse(storedCategories) : [];

function getCategoryByName(name) {
  return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
}

let storedExpenses = localStorage.getItem('expenses');
let expenses = storedExpenses ? JSON.parse(storedExpenses) : [];

let storedIncomes = localStorage.getItem('incomes');
let incomes = storedIncomes ? JSON.parse(storedIncomes) : [];

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(date.setDate(diff));
}

let currentWeekStart = localStorage.getItem('currentWeekStart')
  ? new Date(localStorage.getItem('currentWeekStart'))
  : getMonday(new Date());

function updateWeekHeading() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('weekHeading').textContent = "Week of " + currentWeekStart.toLocaleDateString('en-US', options);
}

function renderTransactions() {
  const expensesColumn = document.getElementById('expensesColumn');
  const incomeColumn = document.getElementById('incomeColumn');
  expensesColumn.innerHTML = '<h2>Expenses</h2>';
  incomeColumn.innerHTML = '<h2>Income</h2>';

  let startStr = getLocalDateString(currentWeekStart);
  let weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  let endStr = getLocalDateString(weekEndDate);

  let weekExpenses = expenses.filter(item => {
    let itemDateLocal = getLocalDateString(parseLocalDateString(item.date));
    return itemDateLocal >= startStr && itemDateLocal <= endStr;
  });
  let weekIncomes = incomes.filter(item => {
    let itemDateLocal = getLocalDateString(parseLocalDateString(item.date));
    return itemDateLocal >= startStr && itemDateLocal <= endStr;
  });

  weekExpenses.forEach(item => {
    const card = createTransactionCard(item, 'expense');
    expensesColumn.appendChild(card);
  });
  weekIncomes.forEach(item => {
    const card = createTransactionCard(item, 'income');
    incomeColumn.appendChild(card);
  });
}

function createTransactionCard(item, type) {
  const card = document.createElement('div');
  card.className = 'transaction-card';

  const leftDiv = document.createElement('div');
  leftDiv.className = 'transaction-left';
  const title = document.createElement('h4');
  title.textContent = item.title;

  const catObj = getCategoryByName(item.category);
  const categoryElem = document.createElement('p');
  categoryElem.textContent = catObj ? catObj.name : item.category;

  const dateElem = document.createElement('p');
  dateElem.className = 'transaction-date';

  // Convert and format date for display
  const localParsed = parseLocalDateString(item.date);
  const formattedDate = localParsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  dateElem.textContent = "Date: " + formattedDate;

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
    let newTitle = prompt("Edit title:", item.title);
    if (newTitle === null) return;
    newTitle = newTitle.trim();
    if (newTitle === "") return;

    let newCategory = prompt("Edit category:", item.category);
    if (newCategory === null) return;
    newCategory = newCategory.trim();
    if (newCategory === "") return;

    let newAmount = promptNumber("Edit amount (e.g., 80 for $80):");
    if (newAmount === null) return;

    // Date editing with validation
    let newDate;
    do {
      // Use formatDateForPrompt to correctly format the stored date for display
      const currentDateString = formatDateForPrompt(item.date);
      newDate = prompt("Edit date (MM/DD/YYYY):", currentDateString);
      if (newDate === null) return; // User cancelled

      newDate = newDate.trim();

      // If blank, keep current date
      if (newDate === "") {
        newDate = item.date;
        break;
      }

      // Validate MM/DD/YYYY format
      if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(newDate)) {
        alert("Please enter a valid date in MM/DD/YYYY format.");
        continue;
      }

      // Parse and validate the date
      const [month, day, year] = newDate.split("/");
      const dateObj = new Date(year, month - 1, day);

      // Check if the date is valid
      if (dateObj.getFullYear() != year || dateObj.getMonth() != month - 1 || dateObj.getDate() != day) {
        alert("Please enter a valid date.");
        continue;
      }

      // Valid date, break out of loop
      break;

    } while (true);

    item.title = newTitle;
    item.category = newCategory;
    if (type === 'expense') {
      item.amount = -Math.abs(newAmount);
    } else {
      item.amount = Math.abs(newAmount);
    }
    item.date = parseLocalDateString(newDate).toISOString().slice(0, 10);  // Store in ISO format

    // Update week if needed
    const newDateObj = parseLocalDateString(newDate);

    const newWeekStart = getMonday(newDateObj);

    if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
      currentWeekStart = newWeekStart;
      localStorage.setItem("currentWeekStart", currentWeekStart.toISOString());
      updateWeekHeading();
    }

    renderTransactions();
    renderTransactionGroups(); // Update transaction groups
    saveData();
  }
}

function parseLocalDateString(dateString) {
  // Check date format and parse accordingly
  if (dateString.includes("-")) {
    const [year, month, day] = dateString.split("-");
    return new Date(+year, +month - 1, +day);
  }
  const [month, day, year] = dateString.split("/");
  return new Date(+year, +month - 1, +day);
}

function deleteTransaction(id, type) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    if (type === 'expense') {
      expenses = expenses.filter(t => t.id !== id);
    } else {
      incomes = incomes.filter(t => t.id !== id);
    }
    renderTransactions();
    renderTransactionGroups(); // Update transaction groups
    saveData();
  }
}

document.getElementById('prevWeekBtn').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
  updateWeekHeading();
  renderTransactions();
  renderTransactionGroups(); // Update transaction groups when week changes
});

document.getElementById('nextWeekBtn').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
  updateWeekHeading();
  renderTransactions();
  renderTransactionGroups(); // Update transaction groups when week changes
});

// Initialize week heading
updateWeekHeading();

document.getElementById('btnAddExpense').addEventListener('click', () => {
  const title = prompt("Enter expense title:");
  if (!title) return;
  const category = prompt("Enter expense category:");
  let amount = promptNumber("Enter expense amount (e.g., 80 for $80):");
  if (amount === null) return;
  const date = promptDate("Enter expense date", new Date());
  const newExpense = {
    id: generateId(),
    title: title.trim(),
    category: category ? category.trim() : "",
    amount: -Math.abs(amount),
    date: parseLocalDateString(date).toISOString().slice(0, 10)  // Store in ISO format
  };
  expenses.push(newExpense);
  const newDateObj = parseLocalDateString(date);
  const newWeekStart = getMonday(newDateObj);
  if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
    currentWeekStart = newWeekStart;
    localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
    updateWeekHeading();
  }
  renderTransactions();
  renderTransactionGroups(); // Update transaction groups
  saveData();
});

document.getElementById('btnAddIncome').addEventListener('click', () => {
  const title = prompt("Enter income title:");
  if (!title) return;
  const category = prompt("Enter income category:");
  let amount = promptNumber("Enter income amount (e.g., 100 for $100):");
  if (amount === null) return;
  const date = promptDate("Enter income date", new Date());
  const newIncome = {
    id: generateId(),
    title: title.trim(),
    category: category ? category.trim() : "",
    amount: Math.abs(amount),
    date: parseLocalDateString(date).toISOString().slice(0, 10)  // Store in ISO format
  };
  incomes.push(newIncome);
  const newDateObj = parseLocalDateString(date);
  const newWeekStart = getMonday(newDateObj);
  if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
    currentWeekStart = newWeekStart;
    localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
    updateWeekHeading();
  }
  renderTransactions();
  renderTransactionGroups(); // Update transaction groups
  saveData();
});

function getTransactionGroups() {
  // Get date range for current week
  let startStr = getLocalDateString(currentWeekStart);
  let weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  let endStr = getLocalDateString(weekEndDate);

  // Filter transactions for the current week
  let weekExpenses = expenses.filter(item => {
    let itemDateLocal = getLocalDateString(parseLocalDateString(item.date));
    return itemDateLocal >= startStr && itemDateLocal <= endStr;
  });

  let weekIncomes = incomes.filter(item => {
    let itemDateLocal = getLocalDateString(parseLocalDateString(item.date));
    return itemDateLocal >= startStr && itemDateLocal <= endStr;
  });

  // Get all unique categories from both expenses and incomes for the current week
  const allTransactions = [...weekExpenses, ...weekIncomes];
  const categories = [...new Set(allTransactions.map(t => t.category))];

  // Create groups for each category
  return categories.map(category => {
    const categoryExpenses = weekExpenses.filter(e => e.category === category);
    const categoryIncomes = weekIncomes.filter(i => i.category === category);

    // Calculate total for this category
    const totalExpenses = categoryExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const totalIncomes = categoryIncomes.reduce((sum, i) => sum + Math.abs(i.amount), 0);

    return {
      category: category,
      expenses: categoryExpenses,
      incomes: categoryIncomes,
      total: totalIncomes - totalExpenses // Incomes are positive, expenses are negative
    };
  });
}

function renderTransactionGroups() {
  const container = document.getElementById('transactionGroupsContainer');
  container.innerHTML = "";

  const groups = getTransactionGroups();

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
    const categoryObj = getCategoryByName(group.category);
    if (categoryObj && categoryObj.budget > 0) {
      budgetDiv = document.createElement('div');
      budgetDiv.className = 'transaction-group-budget';
      budgetDiv.textContent = `Budget: $${categoryObj.budget.toFixed(2)}`;
      budgetDiv.style.fontSize = '0.9rem';
      budgetDiv.style.color = '#A3A3A3';
      budgetDiv.style.fontWeight = '500';
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
  // Load notes from localStorage
  const storedNotes = localStorage.getItem('notes');
  const notes = storedNotes ? storedNotes : '';

  // Initialize EasyMDE on the textarea with simplified configuration
  easyMDE = new EasyMDE({
    element: document.getElementById("notesTextarea"),
    initialValue: notes,
    placeholder: "# Markdown Support\n\n## Formatting\n- **Bold** text with double asterisks\n- *Italic* text with single asterisks\n\n## Headers\n- # Header 1\n- ## Header 2\n- ### Header 3\n- #### Header 4\n- ##### Header 5\n- ###### Header 6\n\n## Lists\n- Bullet points with asterisks\n  * First item\n  * Second item\n  * Third item\n- Numbered lists with numbers\n  1. First item\n  2. Second item\n  3. Third item\n\n## Media Elements\n- [Link Text](https://) to create links\n- ![Image](https://) to insert images\n\n\n",
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

  // Add event listener for changes to save to localStorage
  easyMDE.codemirror.on("change", function () {
    localStorage.setItem('notes', easyMDE.value());
  });
}

// Initial transactions section
renderTransactions();
renderTransactionGroups();
saveData();

// Initialize notes section
initNotes();

// Refresh data when page becomes visible (e.g., after import in Analytics.html)
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) {
    renderTransactionGroups();
  }
});