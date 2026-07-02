import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        Chart: 'readonly',
        EasyMDE: 'readonly',
        MagnateData: 'writable',
        MagnateUtils: 'writable',
        MagnateUI: 'writable',
        MagnateTipsData: 'writable',
        structuredClone: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'warn',
      'eqeqeq': [
        'warn',
        'always',
        {
          null: 'ignore',
        },
      ],
      'curly': ['warn', 'multi-line'],
      'no-var': 'warn',
      'no-duplicate-imports': 'error',
    },
  },
];