// @ts-check
import n from 'eslint-plugin-n';
// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} */
export default {
  plugins: { n },
  rules: {
    ...n.configs.recommended.rules,
    'global-require': 'off',
    'no-buffer-constructor': 'off',
    'no-new-require': 'off',
    'no-path-concat': 'off',
    'n/no-new-require': 'error',
    'n/global-require': 'error',
    'n/no-path-concat': 'error',

    // conflict with import plugin
    'n/no-missing-import': 'off',
    'n/no-unpublished-import': 'off',
  },
};
