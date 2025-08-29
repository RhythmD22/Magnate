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
  return tempDate.toISOString().slice(0, 10);
}

function promptDate(message, defaultDate) {
  defaultDate = defaultDate || new Date();
  let defaultString = getLocalDateString(defaultDate);
  let dateInput = prompt(message + " (YYYY-MM-DD) or leave blank for " + defaultString + ":");
  if (dateInput === null) return null;
  dateInput = dateInput.trim();
  if (dateInput === "") {
    return defaultString;
  }
  return dateInput;
}

function generateId() {
  return Date.now();
}

/* Local Storage Functions */
function saveData() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('incomes', JSON.stringify(incomes));
  localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  localStorage.setItem('categories', JSON.stringify(categories));
}

// Listen for storage changes from other tabs
window.addEventListener('storage', function (e) {
  if (e.key === 'mealPlans') {
    mealPlans = loadMealPlans();
    renderMealPlans();
  }
});

/* Shared Categories Data */
let storedCategories = localStorage.getItem('categories');
// Categories default to an empty array if local storage is empty
let categories = storedCategories ? JSON.parse(storedCategories) : [];

function getCategoryByName(name) {
  return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
}

/* Transactions Functionality */
let storedExpenses = localStorage.getItem('expenses');
// Expenses also default to an empty array if local storage is empty
let expenses = storedExpenses ? JSON.parse(storedExpenses) : [];

let storedIncomes = localStorage.getItem('incomes');
// Incomes also default to an empty array if local storage is empty
let incomes = storedIncomes ? JSON.parse(storedIncomes) : [];

/* Week Navigation & Transaction Rendering */
// Function to get the Monday of a given date
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(date.setDate(diff));
}

// Initialize currentWeekStart from localStorage or compute Monday of today
let currentWeekStart = localStorage.getItem('currentWeekStart')
  ? new Date(localStorage.getItem('currentWeekStart'))
  : getMonday(new Date());

function updateWeekHeading() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('weekHeading').textContent = "Week of " + currentWeekStart.toLocaleDateString(undefined, options);
}

// renderTransactions: compare dates as strings ("YYYY-MM-DD")
function renderTransactions() {
  const expensesColumn = document.getElementById('expensesColumn');
  const incomeColumn = document.getElementById('incomeColumn');
  expensesColumn.innerHTML = '<h2>Expenses</h2>';
  incomeColumn.innerHTML = '<h2>Income</h2>';

  // Get the local date strings for the Monday and Sunday
  let startStr = getLocalDateString(currentWeekStart);
  let weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  let endStr = getLocalDateString(weekEndDate);

  // Compare using local date strings
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

  // Convert the stored date string to a local date object, then to YYYY-MM-DD
  const localParsed = parseLocalDateString(item.date);
  dateElem.textContent = "Date: " + getLocalDateString(localParsed);

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
  editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="display: block; margin: auto; position: relative; top: 2px; left: 2px;">
  <path d="M2.66795 14.6297L13.3222 3.98517L11.6133 2.26642L0.949202 12.911L0.021468 15.0887C-0.0761882 15.3231 0.177718 15.5965 0.412093 15.4988ZM14.1816 3.14533L15.168 2.17853C15.666 1.68048 15.6953 1.14338 15.2461 0.694157L14.914 0.362125C14.4746-0.0773278 13.9375-0.0382653 13.4394 0.450016L12.4531 1.42658Z" fill="white" fill-opacity="0.85"/>
</svg>`;
  editBtn.addEventListener('click', () => editTransaction(item.id, type));
  actionsDiv.appendChild(editBtn);

  const deleteBtn = document.createElement('div');
  deleteBtn.className = 'icon-btn';
  deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="position: relative; left: 0px; top: 0px;">
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

    let newDate = prompt("Edit date (YYYY-MM-DD):", item.date);
    if (newDate === null) return;
    newDate = newDate.trim();
    if (newDate === "") return;

    item.title = newTitle;
    item.category = newCategory;
    if (type === 'expense') {
      item.amount = -Math.abs(newAmount);
    } else {
      item.amount = Math.abs(newAmount);
    }
    item.date = newDate;

    // Use parseLocalDateString to interpret date in local time
    const newDateObj = parseLocalDateString(newDate);

    // Compute the Monday of the new date
    const newWeekStart = getMonday(newDateObj);

    // If the new week start differs, update currentWeekStart and heading
    if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
      currentWeekStart = newWeekStart;
      localStorage.setItem("currentWeekStart", currentWeekStart.toISOString());
      updateWeekHeading();
    }

    renderTransactions();
    saveData();
  }
}

function parseLocalDateString(dateString) {
  // Split the YYYY-MM-DD input
  const [year, month, day] = dateString.split("-");
  // Create a new Date in local time (month is zero-based)
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
    saveData();
  }
}

// Week navigation event listeners
document.getElementById('prevWeekBtn').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
  updateWeekHeading();
  renderTransactions();
});

document.getElementById('nextWeekBtn').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
  updateWeekHeading();
  renderTransactions();
});

// Initialize week heading on page load
updateWeekHeading();

/* Expense & Income Creation */
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
    date: date
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
    date: date
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
  saveData();
});

/* Meal Plan Functionality */
function loadMealPlans() {
  let storedMealPlans = localStorage.getItem('mealPlans');
  return storedMealPlans
    ? JSON.parse(storedMealPlans)
    : [
      {
        id: "default",
        title: "Meal Plan",
        category:
          "For accurate analytics, please use consistent category names across all entries (expenses, incomes, and meal plans). For example, if you label an expense as ‘Groceries,’ use ‘Groceries’ for your meal plan category as well.",
        description: "",
        deductions: []
      }
    ];
}

let mealPlans = loadMealPlans();

let currentEditingPlanId = null;

function renderMealPlans() {
  const container = document.getElementById('mealPlanContainer');
  container.innerHTML = "";
  mealPlans.forEach(plan => {
    const card = document.createElement('div');
    card.className = 'meal-card';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'meal-title';
    titleDiv.textContent = plan.title;
    card.appendChild(titleDiv);

    if (plan.id === "default") {
      const catDiv = document.createElement('div');
      catDiv.className = 'meal-category';
      catDiv.textContent = plan.category;
      card.appendChild(catDiv);
    } else {
      const catDiv = document.createElement('div');
      catDiv.className = 'meal-category';
      catDiv.textContent = plan.category ? plan.category : "Category";
      card.appendChild(catDiv);

      const descDiv = document.createElement('div');
      descDiv.className = 'meal-description';
      descDiv.textContent = plan.description ? plan.description : "No description provided.";
      card.appendChild(descDiv);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'meal-actions';
      const editBtn = document.createElement('div');
      editBtn.className = 'icon-btn';
      editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="display: block; margin: auto; position: relative; top: 2px; left: 3px;">
      <path d="M2.66795 14.6297L13.3222 3.98517L11.6133 2.26642L0.949202 12.911L0.021468 15.0887C-0.0761882 15.3231 0.177718 15.5965 0.412093 15.4988ZM14.1816 3.14533L15.168 2.17853C15.666 1.68048 15.6953 1.14338 15.2461 0.694157L14.914 0.362125C14.4746-0.0773278 13.9375-0.0382653 13.4394 0.450016L12.4531 1.42658Z" fill="white" fill-opacity="0.85"/>
    </svg>`;
      editBtn.addEventListener('click', () => editMealPlan(plan.id));
      actionsDiv.appendChild(editBtn);

      const deleteBtn = document.createElement('div');
      deleteBtn.className = 'icon-btn';
      deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="display: block; margin: auto; position: relative; left: 1.5px; top: 0px;">
      <path d="M6.5625 18.6035C6.93359 18.6035 7.17773 18.3691 7.16797 18.0273L6.86523 7.57812C6.85547 7.23633 6.61133 7.01172 6.25977 7.01172C5.88867 7.01172 5.64453 7.24609 5.6543 7.58789L5.94727 18.0273C5.95703 18.3789 6.20117 18.6035 6.5625 18.6035ZM9.45312 18.6035C9.82422 18.6035 10.0879 18.3691 10.0879 18.0273L10.0879 7.58789C10.0879 7.24609 9.82422 7.01172 9.45312 7.01172C9.08203 7.01172 8.82812 7.24609 8.82812 7.58789L8.82812 18.0273C8.82812 18.3691 9.08203 18.6035 9.45312 18.6035ZM12.3535 18.6035C12.7051 18.6035 12.9492 18.3789 12.959 18.0273L13.252 7.58789C13.2617 7.24609 13.0176 7.01172 12.6465 7.01172C12.2949 7.01172 12.0508 7.23633 12.041 7.58789L11.748 18.0273C11.7383 18.3691 11.9824 18.6035 12.3535 18.6035ZM5.16602 4.46289L6.71875 4.46289L6.71875 2.37305C6.71875 1.81641 7.10938 1.45508 7.69531 1.45508L11.1914 1.45508C11.7773 1.45508 12.168 1.81641 12.168 2.37305L12.168 4.46289L13.7207 4.46289L13.7207 2.27539C13.7207 0.859375 12.8027 0 11.2988 0L7.58789 0C6.08398 0 5.16602 0.859375 5.16602 2.27539ZM0.732422 5.24414L18.1836 5.24414C18.584 5.24414 18.9062 4.90234 18.9062 4.50195C18.9062 4.10156 18.584 3.76953 18.1836 3.76953L0.732422 3.76953C0.341797 3.76953 0 4.10156 0 4.50195C0 4.91211 0.341797 5.24414 0.732422 5.24414ZM4.98047 21.748L13.9355 21.748C15.332 21.748 16.2695 20.8398 16.3379 19.4434L17.0215 5.05859L15.4492 5.05859L14.7949 19.2773C14.7754 19.8633 14.3555 20.2734 13.7793 20.2734L5.11719 20.2734C4.56055 20.2734 4.14062 19.8535 4.11133 19.2773L3.41797 5.05859L1.88477 5.05859L2.57812 19.4531C2.64648 20.8496 3.56445 21.748 4.98047 21.748Z" fill="white" fill-opacity="0.85"/>
    </svg>`;
      deleteBtn.addEventListener('click', () => deleteMealPlan(plan.id));
      actionsDiv.appendChild(deleteBtn);

      card.appendChild(actionsDiv);

      const btnDeduction = document.createElement('button');
      btnDeduction.className = 'btn-meal btn-deduction';
      btnDeduction.textContent = "Add Deduction";
      btnDeduction.addEventListener('click', () => addDeduction(plan.id));
      card.appendChild(btnDeduction);
    }

    container.appendChild(card);
  });
}

function addDeduction(planId) {
  const description = prompt("Enter deduction description:");
  if (description === null) return;
  if (description.trim() === "") return;
  let amount = promptNumber("Enter deduction amount (e.g., 20 for $20 deduction):");
  if (amount === null) return;
  const date = promptDate("Enter deduction date", new Date());
  if (date === null) return;
  const plan = mealPlans.find(p => p.id === planId);
  if (!plan) return;
  const deduction = { description: description.trim(), category: plan.category, amount: -Math.abs(amount) };
  plan.deductions.push(deduction);
  const newExpense = {
    id: generateId(),
    title: `Deduction from ${plan.title}: ${deduction.description}`,
    category: deduction.category,
    amount: deduction.amount,
    date: date
  };
  expenses.push(newExpense);

  // Update week view if the deduction is in a different week
  const newDateObj = parseLocalDateString(date);
  const newWeekStart = getMonday(newDateObj);
  if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
    currentWeekStart = newWeekStart;
    localStorage.setItem('currentWeekStart', currentWeekStart.toISOString());
    updateWeekHeading();
    renderTransactions();
  } else {
    renderTransactions(); // Still need to re-render to show the new expense
  }

  renderMealPlans();
  saveData();
}

function editMealPlan(planId) {
  const plan = mealPlans.find(p => p.id === planId);
  if (!plan || plan.id === "default") {
    alert("This meal plan cannot be edited.");
    return;
  }
  const newTitle = prompt("Edit meal plan title:", plan.title);
  if (newTitle === null) return;
  if (newTitle.trim() === "") return;
  const newCategory = prompt("Edit meal plan category:", plan.category ? plan.category : "Category");
  if (newCategory === null) return;
  if (newCategory.trim() === "") return;

  plan.title = newTitle.trim();
  plan.category = newCategory.trim();

  if (confirm("Do you want to edit the meal plan description?")) {
    currentEditingPlanId = plan.id;
    document.getElementById('descriptionInput').value = plan.description;
    document.getElementById('descriptionModal').style.display = "block";
    document.getElementById('descriptionInput').focus();
  }
  renderMealPlans();
  saveData();
}

function deleteMealPlan(planId) {
  if (planId === "default") {
    alert("The default meal plan cannot be deleted.");
    return;
  }
  if (confirm("Are you sure you want to delete this meal plan?")) {
    mealPlans = mealPlans.filter(p => p.id !== planId);
    renderMealPlans();
    saveData();
  }
}

document.getElementById('btnAddMealPlan').addEventListener('click', () => {
  const title = prompt("Enter new meal plan or grocery title:");
  if (!title) return;
  const category = prompt("Enter new meal plan or grocery category:");
  if (category === null) return;
  const newPlan = { id: generateId(), title: title.trim(), category: category.trim(), description: "", deductions: [] };
  mealPlans.push(newPlan);
  renderMealPlans();
  saveData();
  if (confirm("Would you like to add a description?")) {
    currentEditingPlanId = newPlan.id;
    document.getElementById('descriptionInput').value = newPlan.description;
    document.getElementById('descriptionModal').style.display = "block";
    document.getElementById('descriptionInput').focus();
  }
});

/* Modal Functionality */
const modal = document.getElementById('descriptionModal');
const closeModal = document.getElementById('closeModal');
const saveDescription = document.getElementById('saveDescription');

closeModal.onclick = function () {
  modal.style.display = "none";
}

saveDescription.onclick = function () {
  const newDesc = document.getElementById('descriptionInput').value;
  const plan = mealPlans.find(p => p.id === currentEditingPlanId);
  if (plan) {
    plan.description = newDesc;
  }
  modal.style.display = "none";
  renderMealPlans();
  saveData();
}

/* Final Render Calls */
renderTransactions();
renderMealPlans();
saveData();

// Refresh data when page becomes visible (e.g., after import in Analytics.html)
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) {
    // Reload meal plans from localStorage
    mealPlans = loadMealPlans();
    renderMealPlans();
  }
});