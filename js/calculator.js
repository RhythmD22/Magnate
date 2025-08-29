// Load and display calculation history from localStorage
const calcHistoryElement = document.getElementById('calcHistory');
let calcHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];

function loadCalcHistory() {
  calcHistoryElement.innerHTML = '';
  calcHistory.forEach(entry => {
    const div = document.createElement('div');
    div.textContent = entry;
    calcHistoryElement.prepend(div);
  });
}

function addHistoryEntry(entryText) {
  calcHistory.unshift(entryText);
  localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
  loadCalcHistory();
}

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  if (confirm("Clear calculation history?")) {
    calcHistory = [];
    localStorage.removeItem('calcHistory');
    loadCalcHistory();
  }
});

// Calculator logic
const calcDisplay = document.getElementById('calcDisplay');
let currentValue = '0';
let storedValue = null;
let currentOperation = null;
let shouldReset = false;

function updateDisplay(value) {
  calcDisplay.textContent = value;
}

function clearAll() {
  currentValue = '0';
  storedValue = null;
  currentOperation = null;
  shouldReset = false;
  updateDisplay(currentValue);
}

function appendNumber(num) {
  if (currentValue === '0' || shouldReset) {
    currentValue = num;
    shouldReset = false;
  } else {
    currentValue += num;
  }
  updateDisplay(currentValue);
}

function chooseOperation(op) {
  if (storedValue === null) {
    storedValue = currentValue;
  } else if (currentOperation) {
    compute();
  }
  currentOperation = op;
  shouldReset = true;
}

function compute() {
  if (!currentOperation || storedValue === null) return;
  const prev = parseFloat(storedValue);
  const current = parseFloat(currentValue);
  let result = 0;
  switch (currentOperation) {
    case '+': result = prev + current; break;
    case '-': result = prev - current; break;
    case '*': result = prev * current; break;
    case '/':
      if (current === 0) { alert('Cannot divide by zero'); return; }
      result = prev / current;
      break;
    default: return;
  }
  result = parseFloat(result.toFixed(8));

  // Log calculation to history
  const entry = `${storedValue} ${currentOperation} ${currentValue} = ${result}`;
  addHistoryEntry(entry);

  currentValue = result.toString();
  storedValue = null;
  currentOperation = null;
  updateDisplay(currentValue);
  shouldReset = true;
}

document.querySelectorAll('.calc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const num = btn.getAttribute('data-num');
    const action = btn.getAttribute('data-action');
    if (num !== null) {
      if (num === '.' && currentValue.includes('.')) return;
      appendNumber(num);
    } else if (action !== null) {
      switch (action) {
        case 'clear':
          clearAll();
          break;
        case 'sign':
          currentValue = (parseFloat(currentValue) * -1).toString();
          updateDisplay(currentValue);
          break;
        case 'percent':
          currentValue = (parseFloat(currentValue) / 100).toString();
          updateDisplay(currentValue);
          break;
        case 'divide':
          chooseOperation('/');
          break;
        case 'multiply':
          chooseOperation('*');
          break;
        case 'subtract':
          chooseOperation('-');
          break;
        case 'add':
          chooseOperation('+');
          break;
        case 'equals':
          compute();
          break;
      }
    }
  });
});

loadCalcHistory();
clearAll();