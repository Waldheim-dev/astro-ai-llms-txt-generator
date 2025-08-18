// @ts-check
import globals from 'globals';

import tseslint from 'typescript-eslint';

import js from '@eslint/js';
import unusedImports from 'eslint-plugin-unused-imports';
import jsdoc from 'eslint-plugin-jsdoc';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';

// #region subconfigs
import memberOrderRules from './eslint-subconfigs/member-order.js';
import deactivatedDeprecatedRules from './eslint-subconfigs/deactivate-deprecated-rules.js';
import nodePlugin from './eslint-subconfigs/node-plugin.js';
import eslint from './eslint-subconfigs/eslint-plugin.js';
import typescript from './eslint-subconfigs/typescript-plugin.js';
// #endregion

// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.LanguageOptions} */
const languageOptions = {
  globals: { ...globals.browser, ...globals.node, ...globals.jest },
  parser: tseslint.parser,
  sourceType: 'module',
  parserOptions: {
    extraFileExtensions: ['.ts', '.jsx'],
    project: ['tsconfig.json'],
    ecmaFeatures: {
      jsx: true,
    },
  },
};

const files = ['**/*.js', '**/*.ts'];

const ignores = ['*.config.*', '**/demo/**', '*eslint*', '**/coverage/**/*', '**/build/**', '**/dist/**', '**/node_modules/**/*', '**/test*/*'];

// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} */
const baseConfig = {
  plugins: { 'unused-imports': unusedImports, jsdoc, '@typescript-eslint': tseslint.plugin },
  settings: {
    'import/resolver': {
      //needed for ununsed-imports plugin
      typescript: true, // this loads <rootdir>/tsconfig.json to eslint
    },
  },

  rules: {
    // CUSTOM
    'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    'no-warning-comments': ['warn', { location: 'anywhere' }],
    'no-console': ['warn', { allow: ['info', 'warn', 'error', 'debug'] }],
    'n/no-extraneous-import': 'off',

    // JSDOC
    'jsdoc/require-jsdoc': [
      'error',
      {
        publicOnly: true,
        checkConstructors: false,
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: false,
          ClassExpression: false,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true,
        },
        fixerMessage: ' TODO: Please add a JSDoc comment.',
      },
    ],

    'unused-imports/no-unused-imports': 'error',
  },
};

export default tseslint.config(
  { languageOptions },
  { ignores },
  { files },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsdoc.configs['flat/recommended-typescript-error'],
  memberOrderRules,
  nodePlugin,
  eslint,
  typescript,
  deactivatedDeprecatedRules,
  baseConfig,
  prettierPluginRecommended,
);
