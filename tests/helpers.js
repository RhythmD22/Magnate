import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));

let store;
let MagnateUtils, MagnateData, MagnateCSV, MagnateOFX;

function freshLocalStorage() {
  store = {};
  return {
    getItem(key) { return store[key] ?? null; },
    setItem(key, val) { store[key] = val; },
    removeItem(key) { delete store[key]; },
  };
}

export function setupGlobals() {
  store = {};
  globalThis.window = globalThis;
  globalThis.localStorage = freshLocalStorage();
  globalThis.document = {
    body: {
      appendChild() { },
      removeChild() { },
      contains() { return false; },
    },
    createElement(tag) {
      if (tag === 'a') {
        return { setAttribute() { }, click() { } };
      }
      if (tag === 'input') {
        return { type: '', accept: '', onchange: null, click() { } };
      }
      return {};
    },
  };
  globalThis.Blob = class Blob {
    constructor(content, opts) {
      this._content = content;
      this.type = opts?.type || '';
    }
    text() { return Promise.resolve(this._content.join ? this._content.join('') : this._content); }
  };
  globalThis.URL = {
    createObjectURL() { return 'blob:mock'; },
    revokeObjectURL() { },
  };
  globalThis.location = {
    href: '',
    reload() { },
  };

  globalThis.MagnateUI = {
    alert: async () => true,
    confirm: async () => true,
    prompt: async () => 'test',
    promptNumber: async () => 42,
    promptDate: async () => '01/01/2024',
  };
}

export function clearStore() {
  store = {};
  globalThis.localStorage = freshLocalStorage();
}

export function getStore() {
  return store;
}

function loadModule(filename) {
  const code = readFileSync(join(__dirname, '..', 'js', filename), 'utf-8');
  vm.runInThisContext(code);
}

export function loadUtils() {
  loadModule('utils.js');
  MagnateUtils = globalThis.MagnateUtils;
  return MagnateUtils;
}

export function loadDataManager() {
  if (!globalThis.MagnateUtils) loadUtils();
  loadModule('data-manager.js');
  MagnateData = globalThis.MagnateData;
  return MagnateData;
}

export function loadCSVHandler() {
  if (!globalThis.MagnateData) loadDataManager();
  loadModule('csv-handler.js');
  MagnateCSV = globalThis.MagnateCSV;
  return MagnateCSV;
}

export function loadOFXHandler() {
  if (!globalThis.MagnateData) loadDataManager();
  loadModule('ofx-handler.js');
  MagnateOFX = globalThis.MagnateOFX;
  return MagnateOFX;
}

export function resetAll() {
  clearStore();
  delete globalThis.MagnateUtils;
  delete globalThis.MagnateData;
  delete globalThis.MagnateCSV;
  delete globalThis.MagnateOFX;
  MagnateUtils = undefined;
  MagnateData = undefined;
  MagnateCSV = undefined;
  MagnateOFX = undefined;
}