import tseslint from 'typescript-eslint';

// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} */
export default {
  plugins: { '@typescript-eslint': tseslint.plugin },
  rules: {
    'no-new-object': 'off', // replaced by no-object-constructor
    'no-object-constructor': 'error',

    '@typescript-eslint/no-throw-literal': 'off', // only-throw-error
    '@typescript-eslint/only-throw-error': 'error',
  },
};
