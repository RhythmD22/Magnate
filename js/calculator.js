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
  calcHistory.forEach((entry, index) => {
    const div = document.createElement('div');
    // All entries should now be in the new format, but we'll keep the check for safety
    if (typeof entry === 'object' && entry.calculation && entry.timestamp) {
      // Format the ISO timestamp for display
      const dateObj = new Date(entry.timestamp);
      // Display format: MM/DD/YYYY HH:MM
      const displayTimestamp = dateObj.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
        dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      // New format with timestamp and delete button
      div.className = 'history-entry';
      div.innerHTML = `
        <span class="calculation">${entry.calculation}</span>
        <span class="timestamp">${displayTimestamp}</span>
        <button class="delete-btn" data-index="${index}">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
            <path d="M6.5625 18.6035C6.93359 18.6035 7.17773 18.3691 7.16797 18.0273L6.86523 7.57812C6.85547 7.23633 6.61133 7.01172 6.25977 7.01172C5.88867 7.01172 5.64453 7.24609 5.6543 7.58789L5.94727 18.0273C5.95703 18.3789 6.20117 18.6035 6.5625 18.6035ZM9.45312 18.6035C9.82422 18.6035 10.0879 18.3691 10.0879 18.0273L10.0879 7.58789C10.0879 7.24609 9.82422 7.01172 9.45312 7.01172C9.08203 7.01172 8.82812 7.24609 8.82812 7.58789L8.82812 18.0273C8.82812 18.3691 9.08203 18.6035 9.45312 18.6035ZM12.3535 18.6035C12.7051 18.6035 12.9492 18.3789 12.959 18.0273L13.252 7.58789C13.2617 7.24609 13.0176 7.01172 12.6465 7.01172C12.2949 7.01172 12.0508 7.23633 12.041 7.58789L11.748 18.0273C11.7383 18.3691 11.9824 18.6035 12.3535 18.6035ZM5.16602 4.46289L6.71875 4.46289L6.71875 2.37305C6.71875 1.81641 7.10938 1.45508 7.69531 1.45508L11.1914 1.45508C11.7773 1.45508 12.168 1.81641 12.168 2.37305L12.168 4.46289L13.7207 4.46289L13.7207 2.27539C13.7207 0.859375 12.8027 0 11.2988 0L7.58789 0C6.08398 0 5.16602 0.859375 5.16602 2.27539ZM0.732422 5.24414L18.1836 5.24414C18.584 5.24414 18.9062 4.90234 18.9062 4.50195C18.9062 4.10156 18.584 3.76953 18.1836 3.76953L0.732422 3.76953C0.341797 3.76953 0 4.10156 0 4.50195C0 4.91211 0.341797 5.24414 0.732422 5.24414ZM4.98047 21.748L13.9355 21.748C15.332 21.748 16.2695 20.8398 16.3379 19.4434L17.0215 5.05859L15.4492 5.05859L14.7949 19.2773C14.7754 19.8633 14.3555 20.2734 13.7793 20.2734L5.11719 20.2734C4.56055 20.2734 4.14062 19.8535 4.11133 19.2773L3.41797 5.05859L1.88477 5.05859L2.57812 19.4531C2.64648 20.8496 3.56445 21.748 4.98047 21.748Z" fill="white" fill-opacity="0.85"/>
          </svg>
        </button>
      `;
      
      // Add event listener for delete button
      const deleteBtn = div.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(deleteBtn.getAttribute('data-index'));
        deleteHistoryEntry(index);
      });
      
      // Add click/tap behavior for mobile
      div.addEventListener('click', function(e) {
        // Check if it's a touch device and the click wasn't on the delete button
        if (('ontouchstart' in window || navigator.maxTouchPoints) && e.target !== deleteBtn) {
          // Prevent default to avoid triggering computation
          e.preventDefault();
          
          // Toggle selected class
          const isSelected = this.classList.contains('selected');
          
          // Remove selected class from all entries
          document.querySelectorAll('.history-entry').forEach(entry => {
            entry.classList.remove('selected');
          });
          
          // Add selected class to this entry if it wasn't already selected
          if (!isSelected) {
            this.classList.add('selected');
          }
        }
      });
      
      calcHistoryElement.prepend(div);
    } else {
      // Fallback for any unexpected format
      console.warn('Unexpected history entry format:', entry);
    }
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

function deleteHistoryEntry(index) {
  if (confirm("Are you sure you want to delete this calculation?")) {
    calcHistory.splice(index, 1);
    localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
    loadCalcHistory();
  }
}

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  if (confirm("Clear all calculation history?")) {
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