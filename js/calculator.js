// Load and display calculation history from localStorage
const calcHistoryElement = document.getElementById('calcHistory');
let calcHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];

// Convert old format entries (strings) to new format (objects with timestamp)
// For backward compatibility, we'll use a generic "Imported" timestamp for old entries
let needsSave = false;
for (let i = 0; i < calcHistory.length; i++) {
  if (typeof calcHistory[i] === 'string') {
    calcHistory[i] = {
      calculation: calcHistory[i],
      timestamp: new Date().toISOString() // Use current time for imported entries
    };
    needsSave = true;
  }
}

// Save updated format back to localStorage if needed
if (needsSave) {
  localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
}

function loadCalcHistory() {
  calcHistoryElement.innerHTML = '';
  calcHistory.forEach(entry => {
    const div = document.createElement('div');
    // All entries should now be in the new format, but we'll keep the check for safety
    if (typeof entry === 'object' && entry.calculation && entry.timestamp) {
      // Format the ISO timestamp for display
      const dateObj = new Date(entry.timestamp);
      // Display format: MM/DD/YYYY HH:MM
      const displayTimestamp = dateObj.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
        dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      // New format with timestamp
      div.innerHTML = `<span class="calculation">${entry.calculation}</span><span class="timestamp">${displayTimestamp}</span>`;
    } else {
      // Fallback for any unexpected format
      console.warn('Unexpected history entry format:', entry);
    }
    calcHistoryElement.prepend(div);
  });
}

function addHistoryEntry(entryText) {
  // Create an object with the calculation and timestamp
  const now = new Date();
  // Store in ISO format for consistency and easy parsing
  const isoTimestamp = now.toISOString();
  const historyEntry = {
    calculation: entryText,
    timestamp: isoTimestamp
  };

  calcHistory.unshift(historyEntry);
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
  // If we have a pending operation, compute it first
  if (currentOperation && storedValue !== null) {
    compute();
  }
  // If we don't have a stored value yet, store the current value
  if (storedValue === null) {
    storedValue = currentValue;
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
  storedValue = result.toString(); // Keep the result as the new stored value for chaining
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