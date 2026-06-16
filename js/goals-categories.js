(function () {
  'use strict';

  let lm;

  document.addEventListener('DOMContentLoaded', function () {
    lm = MagnateUtils.createListenerManager();

    function highlightDollarAmounts(element) {
      const text = element.textContent;
      element.textContent = "";
      const parts = text.split(/(\$(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)/g);
      parts.forEach(part => {
        if (/^\$(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(part)) {
          const span = document.createElement('span');
          span.className = 'dollar';
          span.textContent = part;
          element.appendChild(span);
        } else {
          element.appendChild(document.createTextNode(part));
        }
      });
    }

    let goals = MagnateData.goals;
    let categories = MagnateData.categories;
    let monthlyBudgets = MagnateData.monthlyBudgets;
    let categoryBudgets = MagnateData.categoryBudgets;

    let selectedMonth = new Date();
    selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);

    function saveAndRefreshGoals() {
      MagnateData.saveData();
      renderGoals();
    }

    function saveAndRefreshCategories() {
      MagnateData.saveData();
      renderCategories();
    }

    function getMonthlyBudget() {
      let key = MagnateUtils.getMonthKey(selectedMonth);
      return monthlyBudgets[key] || 1000;
    }

    function updateMonthlyBudgetDisplay() {
      let monthYearStr = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      document.getElementById('monthlyBudgetDisplay').innerHTML =
        '<button class="icon-btn month-nav-btn" style="font-size: inherit;">&lt;</button>' +
        '<span class="current-month-year">' + monthYearStr + '</span>' +
        '<button class="icon-btn month-nav-btn" style="font-size: inherit;">&gt;</button>' +
        ' : ' +
        '<span class="dollar">$' + MagnateUtils.formatNumber(getMonthlyBudget()) + '</span>';
    }

    async function changeMonth(offset) {
      let newMonth = selectedMonth.getMonth() + offset;
      selectedMonth = new Date(selectedMonth.getFullYear(), newMonth, 1);
      let key = MagnateUtils.getMonthKey(selectedMonth);
      if (monthlyBudgets[key] === undefined) {
        let newBudget = await MagnateUtils.promptNumber("Enter new Total Monthly Budget:");
        monthlyBudgets[key] = newBudget === null ? 1000 : newBudget;
        MagnateData.saveData();
      }
      updateMonthlyBudgetDisplay();
      renderCategories();
    }

    function createActionButtons(onEdit, onDelete) {
      const actions = document.createElement('div');
      actions.className = 'goal-actions';

      const editBtn = document.createElement('div');
      editBtn.className = 'icon-btn';
      editBtn.innerHTML = MagnateUtils.SVG_EDIT_ICON;
      lm.add(editBtn, 'click', onEdit);
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement('div');
      deleteBtn.className = 'icon-btn';
      deleteBtn.innerHTML = MagnateUtils.SVG_DELETE_ICON;
      lm.add(deleteBtn, 'click', onDelete);
      actions.appendChild(deleteBtn);

      return actions;
    }

    function renderGoals() {
      const container = document.getElementById('goalsContainer');
      if (!container) return;
      container.innerHTML = "";
      lm.clearDetached();
      goals.forEach(goal => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        const info = document.createElement('div');
        info.className = 'goal-info';
        const h3 = document.createElement('h3');
        h3.textContent = goal.title;
        highlightDollarAmounts(h3);
        info.appendChild(h3);
        const pDesc = document.createElement('p');
        if (goal.description && goal.description.trim() !== "") {
          pDesc.textContent = goal.description;
          highlightDollarAmounts(pDesc);
        } else {
          pDesc.innerHTML = "&nbsp;";
        }
        info.appendChild(pDesc);

        const progressContainer = document.createElement('div');
        progressContainer.className = 'goal-progress';
        const progressBg = document.createElement('div');
        progressBg.className = 'progress-bar-bg';
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-bar-fill';
        let percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        progressFill.style.width = percentage + "%";
        progressBg.appendChild(progressFill);
        progressContainer.appendChild(progressBg);
        info.appendChild(progressContainer);

        const pAmount = document.createElement('p');
        pAmount.innerHTML = "<span class='dollar'>$" + MagnateUtils.formatNumber(goal.current) + "</span> of <span class='dollar'>$" + MagnateUtils.formatNumber(goal.target) + "</span> saved";
        info.appendChild(pAmount);

        card.appendChild(info);

        const actions = createActionButtons(
          () => editGoal(goal.id),
          () => deleteGoal(goal.id)
        );
        card.appendChild(actions);
        container.appendChild(card);
      });
    }

    function renderCategories() {
      const container = document.getElementById('categoriesContainer');
      if (!container) return;
      container.innerHTML = "";
      lm.clearDetached();

      let monthKey = MagnateUtils.getMonthKey(selectedMonth);
      if (!categoryBudgets[monthKey]) {
        categoryBudgets[monthKey] = {};
      }

      categories.forEach(cat => {
        const catIdStr = String(cat.id);
        if (categoryBudgets[monthKey][catIdStr] === undefined) {
          categoryBudgets[monthKey][catIdStr] = cat.budget;
        }
        const budgetThisMonth = categoryBudgets[monthKey][catIdStr];

        const card = document.createElement('div');
        card.className = 'category-card';

        const info = document.createElement('div');
        info.className = 'category-info';

        const h3 = document.createElement('h3');
        h3.textContent = cat.name;
        info.appendChild(h3);

        const pBudget = document.createElement('p');
        pBudget.innerHTML = `Budget: <span class="dollar">$${MagnateUtils.formatNumber(budgetThisMonth)}</span>`;
        info.appendChild(pBudget);
        card.appendChild(info);

        const actions = createActionButtons(
          () => editCategory(cat.id),
          () => deleteCategory(cat.id)
        );
        actions.className = 'category-actions';
        card.appendChild(actions);
        container.appendChild(card);
      });
      MagnateData.saveData();
    }

    async function editGoal(id) {
      let goal = goals.find(g => g.id === id);
      if (!goal) return;

      let hasChanges = false;

      let newTitle = await MagnateUI.prompt("Edit goal title:", goal.title);
      if (newTitle === null) return;
      newTitle = newTitle.trim();
      if (newTitle === "") newTitle = goal.title;
      if (newTitle !== goal.title) {
        goal.title = newTitle;
        hasChanges = true;
      }

      let newDesc = await MagnateUI.prompt("Edit goal description:", goal.description);
      if (newDesc === null) { if (hasChanges) saveAndRefreshGoals(); return; }
      newDesc = newDesc.trim();
      if (newDesc !== goal.description) {
        goal.description = newDesc;
        hasChanges = true;
      }

      let newCurrent = await MagnateUtils.promptNumber("Edit current saved amount (current: " + goal.current + "):");
      if (newCurrent === null) { if (hasChanges) saveAndRefreshGoals(); return; }
      if (newCurrent !== goal.current) {
        goal.current = newCurrent;
        hasChanges = true;
      }

      let newTarget = await MagnateUtils.promptNumber("Edit goal target amount (current: " + goal.target + "):");
      if (newTarget === null) { if (hasChanges) saveAndRefreshGoals(); return; }
      if (newTarget <= 0) {
        await MagnateUI.alert("Target must be greater than 0.");
        if (hasChanges) saveAndRefreshGoals();
        return;
      }
      if (newTarget !== goal.target) {
        goal.target = newTarget;
        hasChanges = true;
      }

      if (hasChanges) saveAndRefreshGoals();
    }

    async function deleteGoal(id) {
      const confirmed = await MagnateUI.confirm("Are you sure you want to delete this goal?");
      if (confirmed) {
        MagnateData.goals = MagnateData.goals.filter(g => g.id !== id);
        MagnateData.saveData();
        goals = MagnateData.goals;
        renderGoals();
      }
    }

    async function editCategory(id) {
      let cat = categories.find(c => c.id === id);
      if (!cat) return;

      let hasChanges = false;

      let newName = await MagnateUI.prompt("Edit category name:", cat.name);
      if (newName === null) return;
      newName = newName.trim();
      if (newName === "") newName = cat.name;
      if (newName !== cat.name) {
        cat.name = newName;
        hasChanges = true;
      }

      let monthKey = MagnateUtils.getMonthKey(selectedMonth);
      if (!categoryBudgets[monthKey]) {
        categoryBudgets[monthKey] = {};
      }

      const catIdStr = String(cat.id);
      let currentBudget = categoryBudgets[monthKey][catIdStr] !== undefined ? categoryBudgets[monthKey][catIdStr] : cat.budget;
      let newBudget = await MagnateUtils.promptNumber("Edit monthly budget for " + cat.name + " (current: " + currentBudget + "):");
      if (newBudget === null) {
        if (hasChanges) saveAndRefreshCategories();
        return;
      }
      if (newBudget !== currentBudget) {
        categoryBudgets[monthKey][catIdStr] = newBudget;
        cat.budget = newBudget;
        hasChanges = true;
      }

      if (hasChanges) saveAndRefreshCategories();
    }

    async function deleteCategory(id) {
      const confirmed = await MagnateUI.confirm("Are you sure you want to delete this category?");
      if (confirmed) {
        MagnateData.categories = MagnateData.categories.filter(c => c.id !== id);
        const catIdStr = String(id);
        for (const monthKey in MagnateData.categoryBudgets) {
          delete MagnateData.categoryBudgets[monthKey][catIdStr];
        }
        MagnateData.saveData();
        categories = MagnateData.categories;
        renderCategories();
      }
    }

    const addCategoryHandler = async () => {
      const name = await MagnateUI.prompt("Enter category name:");
      if (!name) return;
      const budget = await MagnateUtils.promptNumber("Enter monthly budget for this category:");
      if (budget === null) return;

      const newCat = { id: MagnateUtils.generateId(), name: name.trim(), budget: budget };
      categories.push(newCat);

      let monthKey = MagnateUtils.getMonthKey(selectedMonth);
      if (!categoryBudgets[monthKey]) {
        categoryBudgets[monthKey] = {};
      }
      categoryBudgets[monthKey][String(newCat.id)] = budget;
      MagnateData.saveData();

      renderCategories();
    };

    lm.add(document.getElementById('btnAddCategory'), 'click', addCategoryHandler);

    const addGoalHandler = async () => {
      const title = await MagnateUI.prompt("Enter goal title:");
      if (!title) return;
      const description = await MagnateUI.prompt("Enter goal description:");
      const current = await MagnateUtils.promptNumber("Enter current saved amount:");
      if (current === null) return;
      const target = await MagnateUtils.promptNumber("Enter goal target amount:");
      if (target === null) return;
      if (target <= 0) {
        await MagnateUI.alert("Target must be greater than 0.");
        return;
      }
      const newGoal = {
        id: MagnateUtils.generateId(),
        title: title.trim(),
        description: description ? description.trim() : "",
        current: current,
        target: target
      };
      goals.push(newGoal);
      MagnateData.saveData();
      renderGoals();
    };

    lm.add(document.getElementById('btnAddGoal'), 'click', addGoalHandler);

    const editBudgetHandler = async () => {
      let key = MagnateUtils.getMonthKey(selectedMonth);
      let newBudget = await MagnateUtils.promptNumber("Enter new Total Monthly Budget:");
      if (newBudget !== null) {
        monthlyBudgets[key] = newBudget;
        MagnateData.saveData();
        updateMonthlyBudgetDisplay();
      }
    };

    lm.add(document.getElementById('btnEditBudget'), 'click', editBudgetHandler);

    lm.add(document.getElementById('monthlyBudgetDisplay'), 'click', function (e) {
      const btn = e.target.closest('.month-nav-btn');
      if (!btn) return;
      changeMonth(btn.textContent === '<' ? -1 : 1);
    });

    renderGoals();
    renderCategories();
    updateMonthlyBudgetDisplay();
  });

  window.addEventListener('beforeunload', function () {
    if (lm) lm.cleanup();
  });
})();