(function () {
  'use strict';

  window.MagnateUI = window.MagnateUI || {};

  const overlay = document.createElement('div');
  overlay.className = 'm-dialog-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'm-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const messageEl = document.createElement('div');
  messageEl.className = 'm-dialog-message';

  const inputEl = document.createElement('input');
  inputEl.className = 'm-dialog-input';
  inputEl.type = 'text';

  const errorEl = document.createElement('div');
  errorEl.className = 'm-dialog-error';

  const actionsEl = document.createElement('div');
  actionsEl.className = 'm-dialog-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'm-dialog-btn m-dialog-btn-cancel';
  cancelBtn.textContent = 'Cancel';

  const okBtn = document.createElement('button');
  okBtn.className = 'm-dialog-btn m-dialog-btn-ok';
  okBtn.textContent = 'OK';

  actionsEl.appendChild(cancelBtn);
  actionsEl.appendChild(okBtn);

  dialog.appendChild(messageEl);
  dialog.appendChild(inputEl);
  dialog.appendChild(errorEl);
  dialog.appendChild(actionsEl);

  let resolvePromise = null;
  let inputType = null;

  function resetDialog() {
    messageEl.textContent = '';
    inputEl.value = '';
    inputEl.style.display = 'none';
    inputEl.type = 'text';
    inputEl.inputMode = 'text';
    errorEl.textContent = '';
    errorEl.style.display = 'none';
    cancelBtn.style.display = '';
    okBtn.textContent = 'OK';
    resolvePromise = null;
    inputType = null;
  }

  function show() {
    if (!overlay.parentNode) {
      document.body.appendChild(overlay);
      overlay.appendChild(dialog);
    }
    overlay.classList.add('m-dialog-active');
    if (inputEl.style.display !== 'none') {
      setTimeout(() => inputEl.focus(), 100);
    }
  }

  function hide() {
    overlay.classList.remove('m-dialog-active');
  }

  function resolve(value) {
    hide();
    const cb = resolvePromise;
    resetDialog();
    if (cb) cb(value);
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay && inputType !== 'prompt' && inputType !== 'promptNumber') {
      resolve(null);
    }
  });

  cancelBtn.addEventListener('click', function () {
    resolve(inputType === 'confirm' ? false : null);
  });

  okBtn.addEventListener('click', function () {
    if (inputType === 'prompt') {
      const val = inputEl.value.trim();
      if (!val) {
        errorEl.textContent = 'Please enter a value.';
        errorEl.style.display = 'block';
        inputEl.focus();
        return;
      }
      resolve(val);
    } else if (inputType === 'promptNumber') {
      const val = inputEl.value.trim();
      if (isNaN(parseFloat(val))) {
        errorEl.textContent = 'Please enter a valid number.';
        errorEl.style.display = 'block';
        inputEl.focus();
        return;
      }
      resolve(parseFloat(val));
    } else if (inputType === 'promptDate') {
      const val = inputEl.value.trim();
      if (val !== '' && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) {
        errorEl.textContent = 'Please enter a valid date in MM/DD/YYYY format.';
        errorEl.style.display = 'block';
        inputEl.focus();
        return;
      }
      if (val !== '') {
        const [month, day, year] = val.split('/');
        const dateObj = new Date(year, month - 1, day);
        if (dateObj.getFullYear() != year || dateObj.getMonth() != month - 1 || dateObj.getDate() != day) {
          errorEl.textContent = 'Please enter a valid date.';
          errorEl.style.display = 'block';
          inputEl.focus();
          return;
        }
      }
      resolve(val);
    } else if (inputType === 'alert') {
      resolve(undefined);
    } else if (inputType === 'confirm') {
      resolve(true);
    }
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      okBtn.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelBtn.click();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('m-dialog-active')) {
      if (inputType === 'alert') {
        resolve(undefined);
      } else if (inputType === 'confirm') {
        resolve(false);
      } else {
        resolve(null);
      }
    }
  });

  function openDialog(config) {
    resetDialog();
    return new Promise(function (resolveFn) {
      resolvePromise = resolveFn;
      inputType = config.type;

      messageEl.textContent = config.message || '';

      if (config.type === 'alert') {
        inputEl.style.display = 'none';
        cancelBtn.style.display = 'none';
        okBtn.textContent = 'OK';
      } else if (config.type === 'confirm') {
        inputEl.style.display = 'none';
        cancelBtn.style.display = '';
        okBtn.textContent = 'Yes';
        cancelBtn.textContent = 'No';
      } else if (config.type === 'prompt' || config.type === 'promptNumber' || config.type === 'promptDate') {
        inputEl.style.display = '';
        inputEl.value = config.defaultValue !== undefined ? config.defaultValue : '';
        if (config.type === 'promptNumber') {
          inputEl.inputMode = 'decimal';
        }
        cancelBtn.style.display = '';
        okBtn.textContent = 'OK';
        cancelBtn.textContent = 'Cancel';
      }

      show();
    });
  }

  MagnateUI.alert = function (message) {
    return openDialog({ type: 'alert', message: message });
  };

  MagnateUI.confirm = function (message) {
    return openDialog({ type: 'confirm', message: message });
  };

  MagnateUI.prompt = function (message, defaultValue) {
    return openDialog({ type: 'prompt', message: message, defaultValue: defaultValue || '' });
  };

  MagnateUI.promptNumber = function (message) {
    return openDialog({ type: 'promptNumber', message: message });
  };

  MagnateUI.promptDate = function (message, defaultValue) {
    return openDialog({ type: 'promptDate', message: message, defaultValue: defaultValue || '' });
  };
})();