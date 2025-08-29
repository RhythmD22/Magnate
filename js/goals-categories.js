// Main application logic wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {

    // Prompt helper
    function promptNumber(message) {
        let input;
        do {
            input = prompt(message);
            if (input === null) return null;
        } while (isNaN(parseFloat(input)) || input.trim() === "");
        return parseFloat(input);
    }

    // Highlight dollar amounts within an element's text
    function highlightDollarAmounts(element) {
        const text = element.textContent;
        element.textContent = "";
        const parts = text.split(/(\$\d+(?:\.\d+)?)/g);
        parts.forEach(part => {
            if (/^\$\d+(?:\.\d+)?$/.test(part)) {
                const span = document.createElement('span');
                span.className = 'dollar';
                span.textContent = part;
                element.appendChild(span);
            } else {
                element.appendChild(document.createTextNode(part));
            }
        });
    }

    // Strip any HTML tags from user-provided text
    function sanitizeText(text) {
        return text.replace(/<[^>]*>/g, '');
    }

    // Goals and Categories stored in localStorage
    let storedGoals = localStorage.getItem('goals');
    let goals = storedGoals ? JSON.parse(storedGoals).map(g => ({
        ...g,
        title: sanitizeText(g.title),
        description: g.description ? sanitizeText(g.description) : ""
    })) : [
        { id: 1, title: "Emergency Fund", description: "Save $1000 by December 2025", current: 450, target: 1000 }
    ];

    let storedCategories = localStorage.getItem('categories');
    let categories = storedCategories ? JSON.parse(storedCategories) : [
        { id: 1, name: "Entertainment", budget: 100 },
        { id: 2, name: "Academic", budget: 150 },
        { id: 3, name: "Food", budget: 300 }
    ];

    // Total Monthly Budget
    let monthlyBudgets = JSON.parse(localStorage.getItem('monthlyBudgets')) || {};

    // Category-specific monthly budgets (keyed by "YYYY-MM" then category id)
    let storedCategoryBudgets = localStorage.getItem('categoryBudgets');
    let categoryBudgets = storedCategoryBudgets ? JSON.parse(storedCategoryBudgets) : {};

    // Global selectedMonth shared by total budget and category budgets
    let selectedMonth = new Date();
    selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);

    function getMonthKey(date) {
        return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2);
    }

    // Total monthly budget getters and renderers
    function getMonthlyBudget() {
        let key = getMonthKey(selectedMonth);
        return monthlyBudgets[key] || 1000;
    }
    function updateMonthlyBudgetDisplay() {
        let key = getMonthKey(selectedMonth);
        let monthYearStr = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        document.getElementById('monthlyBudgetDisplay').innerHTML =
            '<button id="prevMonth" class="icon-btn" style="font-size: inherit;">&lt;</button>' +
            '<span id="currentMonthYear"> ' + monthYearStr + ' </span>' +
            '<button id="nextMonth" class="icon-btn" style="font-size: inherit;">&gt;</button>' +
            ' : ' +
            '<span class="dollar">$' + getMonthlyBudget() + '</span>';
        // Re-attach event listeners as innerHTML is replaced
        document.getElementById('prevMonth')?.addEventListener('click', () => changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => changeMonth(1));
    }
    function changeMonth(offset) {
        let newMonth = selectedMonth.getMonth() + offset;
        selectedMonth = new Date(selectedMonth.getFullYear(), newMonth, 1);
        let key = getMonthKey(selectedMonth);
        if (monthlyBudgets[key] === undefined) {
            let newBudget = promptNumber("Enter new Total Monthly Budget:");
            monthlyBudgets[key] = newBudget === null ? 1000 : newBudget;
            localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
        }
        updateMonthlyBudgetDisplay();
        // Re-render categories so that each category's month shows the new value
        renderCategories();
        if (typeof updateAnalytics === 'function') {
            updateAnalytics();
        }
    }
    document.getElementById('btnEditBudget')?.addEventListener('click', () => {
        let key = getMonthKey(selectedMonth);
        let newBudget = promptNumber("Enter new Total Monthly Budget:");
        if (newBudget !== null) {
            monthlyBudgets[key] = newBudget;
            localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
            updateMonthlyBudgetDisplay();
            if (typeof updateAnalytics === 'function') {
                updateAnalytics();
            }
        }
    });
    updateMonthlyBudgetDisplay(); // Initial call

    // Save data for goals, categories, and categoryBudgets
    function saveData() {
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
    }

    function updateAnalytics() {
        console.log("Goals:", goals);
        console.log("Categories:", categories);
        console.log("Monthly Budgets:", monthlyBudgets);
        console.log("Category Budgets:", categoryBudgets);
        saveData();
    }

    // Render Goals
    function renderGoals() {
        const container = document.getElementById('goalsContainer');
        if (!container) return; // Check if element exists
        container.innerHTML = "";
        goals.forEach(goal => {
            const card = document.createElement('div');
            card.className = 'goal-card';
            const info = document.createElement('div');
            info.className = 'goal-info';
            const h4 = document.createElement('h4');
            h4.textContent = goal.title;
            highlightDollarAmounts(h4);
            info.appendChild(h4);
            const pDesc = document.createElement('p');
            if (goal.description && goal.description.trim() !== "") {
                pDesc.textContent = goal.description;
                highlightDollarAmounts(pDesc);
            } else {
                // Maintain spacing even when there's no description
                pDesc.innerHTML = "&nbsp;"; // Non-breaking space to maintain height
            }
            info.appendChild(pDesc);

            const progressContainer = document.createElement('div');
            progressContainer.className = 'goal-progress';
            const progressBg = document.createElement('div');
            progressBg.className = 'progress-bar-bg';
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-bar-fill';
            let percentage = (goal.current / goal.target) * 100;
            progressFill.style.width = percentage + "%";
            progressBg.appendChild(progressFill);
            progressContainer.appendChild(progressBg);
            info.appendChild(progressContainer);

            const pAmount = document.createElement('p');
            pAmount.innerHTML = "<span class='dollar'>$" + goal.current + "</span> of <span class='dollar'>$" + goal.target + "</span> saved";
            info.appendChild(pAmount);

            card.appendChild(info);

            const actions = document.createElement('div');
            actions.className = 'goal-actions';
            const editBtn = document.createElement('div');
            editBtn.className = 'icon-btn';
            editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="display: block; margin: auto; position: relative; top: 2px; left: 3px;">
          <path d="M2.66795 14.6297L13.3222 3.98517L11.6133 2.26642L0.949202 12.911L0.021468 15.0887C-0.0761882 15.3231 0.177718 15.5965 0.412093 15.4988ZM14.1816 3.14533L15.168 2.17853C15.666 1.68048 15.6953 1.14338 15.2461 0.694157L14.914 0.362125C14.4746-0.0773278 13.9375-0.0382653 13.4394 0.450016L12.4531 1.42658Z" fill="white" fill-opacity="0.85"/>
        </svg>`;
            editBtn.addEventListener('click', () => editGoal(goal.id));
            actions.appendChild(editBtn);

            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'icon-btn';
            deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="position: relative; left: 1.5px; top: 0px;">
          <path d="M6.5625 18.6035C6.93359 18.6035 7.17773 18.3691 7.16797 18.0273L6.86523 7.57812C6.85547 7.23633 6.61133 7.01172 6.25977 7.01172C5.88867 7.01172 5.64453 7.24609 5.6543 7.58789L5.94727 18.0273C5.95703 18.3789 6.20117 18.6035 6.5625 18.6035ZM9.45312 18.6035C9.82422 18.6035 10.0879 18.3691 10.0879 18.0273L10.0879 7.58789C10.0879 7.24609 9.82422 7.01172 9.45312 7.01172C9.08203 7.01172 8.82812 7.24609 8.82812 7.58789L8.82812 18.0273C8.82812 18.3691 9.08203 18.6035 9.45312 18.6035ZM12.3535 18.6035C12.7051 18.6035 12.9492 18.3789 12.959 18.0273L13.252 7.58789C13.2617 7.24609 13.0176 7.01172 12.6465 7.01172C12.2949 7.01172 12.0508 7.23633 12.041 7.58789L11.748 18.0273C11.7383 18.3691 11.9824 18.6035 12.3535 18.6035ZM5.16602 4.46289L6.71875 4.46289L6.71875 2.37305C6.71875 1.81641 7.10938 1.45508 7.69531 1.45508L11.1914 1.45508C11.7773 1.45508 12.168 1.81641 12.168 2.37305L12.168 4.46289L13.7207 4.46289L13.7207 2.27539C13.7207 0.859375 12.8027 0 11.2988 0L7.58789 0C6.08398 0 5.16602 0.859375 5.16602 2.27539ZM0.732422 5.24414L18.1836 5.24414C18.584 5.24414 18.9062 4.90234 18.9062 4.50195C18.9062 4.10156 18.584 3.76953 18.1836 3.76953L0.732422 3.76953C0.341797 3.76953 0 4.10156 0 4.50195C0 4.91211 0.341797 5.24414 0.732422 5.24414ZM4.98047 21.748L13.9355 21.748C15.332 21.748 16.2695 20.8398 16.3379 19.4434L17.0215 5.05859L15.4492 5.05859L14.7949 19.2773C14.7754 19.8633 14.3555 20.2734 13.7793 20.2734L5.11719 20.2734C4.56055 20.2734 4.14062 19.8535 4.11133 19.2773L3.41797 5.05859L1.88477 5.05859L2.57812 19.4531C2.64648 20.8496 3.56445 21.748 4.98047 21.748Z" fill="white" fill-opacity="0.85"/>
        </svg>`;
            deleteBtn.addEventListener('click', () => deleteGoal(goal.id));
            actions.appendChild(deleteBtn);

            card.appendChild(actions);
            container.appendChild(card);
        });
    }

    // Render Expense Categories with monthly budget and month navigation (using global selectedMonth)
    function renderCategories() {
        const container = document.getElementById('categoriesContainer');
        if (!container) return; // Check if element exists
        container.innerHTML = "";

        let monthKey = getMonthKey(selectedMonth);
        // Ensure there is an object for this month
        if (!categoryBudgets[monthKey]) {
            categoryBudgets[monthKey] = {};
        }

        categories.forEach(cat => {
            // Initialize the category's monthly budget if not already set
            const catIdStr = String(cat.id);
            if (categoryBudgets[monthKey][catIdStr] === undefined) {
                categoryBudgets[monthKey][catIdStr] = cat.budget;
            }
            const budgetThisMonth = categoryBudgets[monthKey][catIdStr];

            // Create the category card
            const card = document.createElement('div');
            card.className = 'category-card';

            const info = document.createElement('div');
            info.className = 'category-info';

            // Category title
            const h4 = document.createElement('h4');
            h4.textContent = cat.name;
            info.appendChild(h4);

            // Build the month navigation and budget display line
            const pBudget = document.createElement('p');
            pBudget.innerHTML = `
          <button class="prevCatMonth" style="color: #ffffff; font-size: inherit;">&lt;</button>
          <span class="catMonthYear">${selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <button class="nextCatMonth" style="color: #ffffff; font-size: inherit;">&gt;</button>
           : <span class="dollar">$${budgetThisMonth}</span>
        `;
            info.appendChild(pBudget);
            card.appendChild(info);

            // Hook up month arrow buttons (they update the global month)
            const prevBtn = pBudget.querySelector('.prevCatMonth');
            const nextBtn = pBudget.querySelector('.nextCatMonth');
            prevBtn?.addEventListener('click', () => {
                changeMonth(-1);
                renderCategories();
            });
            nextBtn?.addEventListener('click', () => {
                changeMonth(1);
                renderCategories();
            });

            // Actions for edit/delete
            const actions = document.createElement('div');
            actions.className = 'category-actions';
            const editBtn = document.createElement('div');
            editBtn.className = 'icon-btn';
            editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="display: block; margin: auto; position: relative; top: 2px; left: 3px;">
         <path d="M2.66795 14.6297L13.3222 3.98517L11.6133 2.26642L0.949202 12.911L0.021468 15.0887C-0.0761882 15.3231 0.177718 15.5965 0.412093 15.4988ZM14.1816 3.14533L15.168 2.17853C15.666 1.68048 15.6953 1.14338 15.2461 0.694157L14.914 0.362125C14.4746-0.0773278 13.9375-0.0382653 13.4394 0.450016L12.4531 1.42658Z" fill="white" fill-opacity="0.85"/>
        </svg>`;
            editBtn.addEventListener('click', () => editCategory(cat.id));
            actions.appendChild(editBtn);

            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'icon-btn';
            deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="position: relative; left: 1.5px; top: 0px;">
          <path d="M6.5625 18.6035C6.93359 18.6035 7.17773 18.3691 7.16797 18.0273L6.86523 7.57812C6.85547 7.23633 6.61133 7.01172 6.25977 7.01172C5.88867 7.01172 5.64453 7.24609 5.6543 7.58789L5.94727 18.0273C5.95703 18.3789 6.20117 18.6035 6.5625 18.6035ZM9.45312 18.6035C9.82422 18.6035 10.0879 18.3691 10.0879 18.0273L10.0879 7.58789C10.0879 7.24609 9.82422 7.01172 9.45312 7.01172C9.08203 7.01172 8.82812 7.24609 8.82812 7.58789L8.82812 18.0273C8.82812 18.3691 9.08203 18.6035 9.45312 18.6035ZM12.3535 18.6035C12.7051 18.6035 12.9492 18.3789 12.959 18.0273L13.252 7.58789C13.2617 7.24609 13.0176 7.01172 12.6465 7.01172C12.2949 7.01172 12.0508 7.23633 12.041 7.58789L11.748 18.0273C11.7383 18.3691 11.9824 18.6035 12.3535 18.6035ZM5.16602 4.46289L6.71875 4.46289L6.71875 2.37305C6.71875 1.81641 7.10938 1.45508 7.69531 1.45508L11.1914 1.45508C11.7773 1.45508 12.168 1.81641 12.168 2.37305L12.168 4.46289L13.7207 4.46289L13.7207 2.27539C13.7207 0.859375 12.8027 0 11.2988 0L7.58789 0C6.08398 0 5.16602 0.859375 5.16602 2.27539ZM0.732422 5.24414L18.1836 5.24414C18.584 5.24414 18.9062 4.90234 18.9062 4.50195C18.9062 4.10156 18.584 3.76953 18.1836 3.76953L0.732422 3.76953C0.341797 3.76953 0 4.10156 0 4.50195C0 4.91211 0.341797 5.24414 0.732422 5.24414ZM4.98047 21.748L13.9355 21.748C15.332 21.748 16.2695 20.8398 16.3379 19.4434L17.0215 5.05859L15.4492 5.05859L14.7949 19.2773C14.7754 19.8633 14.3555 20.2734 13.7793 20.2734L5.11719 20.2734C4.56055 20.2734 4.14062 19.8535 4.11133 19.2773L3.41797 5.05859L1.88477 5.05859L2.57812 19.4531C2.64648 20.8496 3.56445 21.748 4.98047 21.748Z" fill="white" fill-opacity="0.85"/>
        </svg>`;
            deleteBtn.addEventListener('click', () => deleteCategory(cat.id));
            actions.appendChild(deleteBtn);

            card.appendChild(actions);
            container.appendChild(card);
        });
        // Save updated categoryBudgets to localStorage
        localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
    }

    // Goal editing and deletion functions
    function editGoal(id) {
        let goal = goals.find(g => g.id === id);
        if (goal) {
            let newTitle = prompt("Edit goal title:", goal.title);
            if (newTitle === null) return;
            newTitle = sanitizeText(newTitle.trim());
            if (newTitle === "") newTitle = goal.title;

            let newDesc = prompt("Edit goal description:", goal.description);
            if (newDesc === null) return;
            newDesc = sanitizeText(newDesc.trim());

            let newCurrent = promptNumber("Edit current saved amount (current: " + goal.current + "):");
            if (newCurrent === null) return;

            let newTarget = promptNumber("Edit goal target amount (current: " + goal.target + "):");
            if (newTarget === null) return;
            if (newTarget <= 0) {
                alert("Target must be greater than 0.");
                return;
            }

            goal.title = newTitle;
            goal.description = newDesc;
            goal.current = newCurrent;
            goal.target = newTarget;
            renderGoals();
            updateAnalytics();
        }
    }

    function deleteGoal(id) {
        if (confirm("Are you sure you want to delete this goal?")) {
            goals = goals.filter(g => g.id !== id);
            renderGoals();
            updateAnalytics();
        }
    }

    // Category editing and deletion functions
    function editCategory(id) {
        let cat = categories.find(c => c.id === id);
        if (cat) {
            let newName = prompt("Edit category name:", cat.name);
            if (newName === null) return;
            newName = newName.trim();
            if (newName === "") newName = cat.name;

            let monthKey = getMonthKey(selectedMonth);
            // Ensure an object for this month exists
            if (!categoryBudgets[monthKey]) {
                categoryBudgets[monthKey] = {};
            }

            const catIdStr = String(cat.id);
            let currentBudget = categoryBudgets[monthKey][catIdStr] !== undefined ? categoryBudgets[monthKey][catIdStr] : cat.budget;
            let newBudget = promptNumber("Edit monthly budget for " + cat.name + " (current: " + currentBudget + "):");
            if (newBudget === null) return;

            // Update the budget in the categoryBudgets for the current month
            categoryBudgets[monthKey][catIdStr] = newBudget;
            localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
            renderCategories();
            updateAnalytics();
        }
    }

    function deleteCategory(id) {
        if (confirm("Are you sure you want to delete this category?")) {
            categories = categories.filter(c => c.id !== id);
            renderCategories();
            updateAnalytics();
        }
    }

    function generateId() {
        return Date.now();
    }

    // New Category Add: also initialize its monthly budget for the current month
    document.getElementById('btnAddCategory')?.addEventListener('click', () => {
        const name = prompt("Enter category name:");
        if (!name) return;
        const budget = promptNumber("Enter monthly budget for this category:");
        if (budget === null) return;

        const newCat = { id: generateId(), name: name.trim(), budget: budget };
        categories.push(newCat);

        let monthKey = getMonthKey(selectedMonth);
        if (!categoryBudgets[monthKey]) {
            categoryBudgets[monthKey] = {};
        }
        categoryBudgets[monthKey][String(newCat.id)] = budget;
        localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));

        renderCategories();
        updateAnalytics();
    });

    // New Goal Add
    document.getElementById('btnAddGoal')?.addEventListener('click', () => {
        const title = prompt("Enter goal title:");
        if (!title) return;
        const description = prompt("Enter goal description:");
        const current = promptNumber("Enter current saved amount:");
        const target = promptNumber("Enter goal target amount:");
        if (target <= 0) {
            alert("Target must be greater than 0.");
            return;
        }
        const newGoal = {
            id: generateId(),
            title: sanitizeText(title.trim()),
            description: description ? sanitizeText(description.trim()) : "",
            current: current,
            target: target
        };
        goals.push(newGoal);
        renderGoals();
        updateAnalytics();
    });

    // Initial rendering
    renderGoals();
    renderCategories();
    updateAnalytics();
});