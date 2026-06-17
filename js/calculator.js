(function () {
  'use strict';

  let lm = MagnateUtils.createListenerManager();

  let calcHistory = MagnateData.calcHistory;

  let needsSave = false;
  for (let i = 0; i < calcHistory.length; i++) {
    if (typeof calcHistory[i] === 'string') {
      calcHistory[i] = {
        calculation: calcHistory[i],
        timestamp: new Date().toISOString()
      };
      needsSave = true;
    }
  }

  if (needsSave) {
    MagnateData.calcHistory = calcHistory;
    MagnateData.saveData();
  }

  function performCalculation(op, val1, val2) {
    switch (op) {
      case '+':
        return val1 + val2;
      case '-':
        return val1 - val2;
      case '*':
        return val1 * val2;
      case '/':
        if (val2 === 0) {
          MagnateUI.alert('Cannot divide by zero');
          clearAll();
          return null;
        }
        return val1 / val2;
      default:
        return val2;
    }
  }

  function loadCalcHistory() {
    const calcHistoryElement = document.getElementById('calcHistory');
    if (!calcHistoryElement) return;

    calcHistoryElement.innerHTML = '';
    lm.clearDetached();

    if (calcHistory.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.style.cssText = 'text-align:center;padding:2rem 1rem;color:var(--color-text-muted);font-size:0.9rem;';
      emptyMsg.textContent = 'No calculations yet.';
      calcHistoryElement.appendChild(emptyMsg);
      return;
    }

    const fragment = document.createDocumentFragment();

    calcHistory.forEach((entry, index) => {
      if (typeof entry === 'object' && entry.calculation && entry.timestamp) {
        const dateObj = new Date(entry.timestamp);
        const displayTimestamp = dateObj.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
          dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const formattedCalculation = formatCalculationString(entry.calculation);

        const div = document.createElement('div');
        div.className = 'history-entry';

        const calcSpan = document.createElement('span');
        calcSpan.className = 'calculation';
        calcSpan.textContent = formattedCalculation;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'timestamp';
        timeSpan.textContent = displayTimestamp;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('data-index', index);
        deleteBtn.setAttribute('aria-label', 'Delete calculation');
        deleteBtn.innerHTML = MagnateUtils.SVG_DELETE_ICON;

        div.appendChild(calcSpan);
        div.appendChild(timeSpan);
        div.appendChild(deleteBtn);

        const deleteHandler = (e) => {
          e.stopPropagation();
          const index = parseInt(deleteBtn.getAttribute('data-index'));
          deleteHistoryEntry(index);
        };
        lm.add(deleteBtn, 'click', deleteHandler);

        const selectEntryHandler = function (e) {
          const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;

          if (e.target.closest('.delete-btn')) return;

          if (isTouchDevice) {
            e.preventDefault();

            const isSelected = this.classList.contains('selected');

            document.querySelectorAll('.history-entry').forEach(entry => {
              entry.classList.remove('selected');
            });

            if (!isSelected) {
              this.classList.add('selected');
            }
          }
        };
        lm.add(div, 'click', selectEntryHandler);

        fragment.appendChild(div);
      } else {
        console.warn('Unexpected history entry format:', entry);
      }
    });

    calcHistoryElement.appendChild(fragment);
  }

  function addHistoryEntry(entryText) {
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const historyEntry = {
      calculation: entryText,
      timestamp: isoTimestamp
    };

    calcHistory.unshift(historyEntry);
    MagnateData.calcHistory = calcHistory;
    MagnateData.saveData();
    loadCalcHistory();
  }

  async function deleteHistoryEntry(index) {
    const confirmed = await MagnateUI.confirm("Are you sure you want to delete this calculation?");
    if (confirmed) {
      calcHistory.splice(index, 1);
      MagnateData.calcHistory = calcHistory;
      MagnateData.saveData();
      loadCalcHistory();
    }
  }

  const clearHistoryHandler = async () => {
    const confirmed = await MagnateUI.confirm("Clear all calculation history?");
    if (confirmed) {
      calcHistory = [];
      MagnateData.calcHistory = calcHistory;
      MagnateData.saveData();
      loadCalcHistory();
    }
  };

  let currentValue = '0';
  let previousValue = null;
  let currentOperation = null;
  let waitingForOperand = false;

  function formatCalculationString(calcStr) {
    return calcStr.replace(/(\d+\.?\d*)/g, (match) => {
      return MagnateUtils.formatNumber(match);
    });
  }

  function updateDisplay(value) {
    const calcDisplay = document.getElementById('calcDisplay');
    if (calcDisplay) {
      calcDisplay.textContent = MagnateUtils.formatNumber(value);
    }
  }

  function clearAll() {
    currentValue = '0';
    previousValue = null;
    currentOperation = null;
    waitingForOperand = false;
    updateDisplay(currentValue);
  }

  function inputDigit(digit) {
    if (waitingForOperand) {
      currentValue = digit;
      waitingForOperand = false;
    } else {
      const cleanValue = currentValue.replace(/,/g, '');
      currentValue = cleanValue === '0' ? digit : cleanValue + digit;
    }
    updateDisplay(currentValue);
  }

  function inputDecimal() {
    if (waitingForOperand) {
      currentValue = '0.';
      waitingForOperand = false;
    } else {
      const cleanValue = currentValue.replace(/,/g, '');
      if (!cleanValue.includes('.')) {
        currentValue = cleanValue + '.';
      }
    }
    updateDisplay(currentValue);
  }

  function handleOperator(nextOperator) {
    const cleanValue = currentValue.replace(/,/g, '');
    const inputValue = parseFloat(cleanValue);

    if (previousValue === null) {
      previousValue = inputValue;
    } else if (currentOperation) {
      const currentValueFloat = parseFloat(cleanValue);
      const leftOperand = previousValue;
      const result = performCalculation(currentOperation, leftOperand, currentValueFloat);

      if (result !== null) {
        previousValue = parseFloat(result.toPrecision(12));
        currentValue = `${previousValue}`;
        updateDisplay(currentValue);

        const entry = `${leftOperand} ${currentOperation} ${currentValueFloat} = ${previousValue}`;
        addHistoryEntry(entry);
      }
    }

    waitingForOperand = true;
    currentOperation = nextOperator;
  }

  function handleEquals() {
    if (currentOperation && previousValue !== null) {
      const cleanValue = currentValue.replace(/,/g, '');
      const inputValue = parseFloat(cleanValue);
      const result = performCalculation(currentOperation, previousValue, inputValue);

      if (result !== null) {
        const finalResult = parseFloat(result.toPrecision(12));

        const entry = `${previousValue} ${currentOperation} ${inputValue} = ${finalResult}`;
        addHistoryEntry(entry);

        currentValue = `${finalResult}`;
        updateDisplay(currentValue);

        previousValue = null;
        currentOperation = null;
        waitingForOperand = true;
      }
    }
  }

  function handleSign() {
    const cleanValue = currentValue.replace(/,/g, '');
    currentValue = parseFloat(cleanValue) * -1 + '';
    updateDisplay(currentValue);
  }

  function handlePercent() {
    const cleanValue = currentValue.replace(/,/g, '');
    currentValue = parseFloat(cleanValue) / 100 + '';
    updateDisplay(currentValue);
  }

  const calcBtnHandler = (e) => {
    const btn = e.target.closest('.calc-btn');
    if (!btn) return;

    const num = btn.getAttribute('data-num');
    const action = btn.getAttribute('data-action');

    if (num !== null) {
      if (num === '.') {
        inputDecimal();
      } else {
        inputDigit(num);
      }
    } else if (action !== null) {
      switch (action) {
        case 'clear':
          clearAll();
          break;
        case 'sign':
          handleSign();
          break;
        case 'percent':
          handlePercent();
          break;
        case 'divide':
          handleOperator('/');
          break;
        case 'multiply':
          handleOperator('*');
          break;
        case 'subtract':
          handleOperator('-');
          break;
        case 'add':
          handleOperator('+');
          break;
        case 'equals':
          handleEquals();
          break;
      }
    }
  };

  let handleKeydown = null;

  document.addEventListener('DOMContentLoaded', function () {
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
      lm.add(clearHistoryBtn, 'click', clearHistoryHandler);
    }

    const calcContainer = document.querySelector('.calculator-container');
    if (calcContainer) {
      lm.add(calcContainer, 'click', calcBtnHandler);
    }

    handleKeydown = function (e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (document.querySelector('.m-dialog-active')) return;

      const key = e.key;
      if (key >= '0' && key <= '9') {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+') {
        handleOperator('+');
      } else if (key === '-') {
        handleOperator('-');
      } else if (key === '*') {
        handleOperator('*');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('/');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Escape') {
        clearAll();
      } else if (key === 'Backspace') {
        e.preventDefault();
        const clean = currentValue.replace(/,/g, '');
        if (clean.length <= 1 || (clean.length === 2 && clean.startsWith('-'))) {
          currentValue = '0';
        } else {
          currentValue = clean.slice(0, -1);
        }
        updateDisplay(currentValue);
      } else if (key === '%') {
        handlePercent();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    loadCalcHistory();
    clearAll();
    document.getElementById('calcDisplay')?.focus();
  });

  window.addEventListener('beforeunload', function () {
    lm.cleanup();
    if (handleKeydown) document.removeEventListener('keydown', handleKeydown);
  });
})();