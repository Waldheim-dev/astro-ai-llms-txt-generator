// @ts-check
// @ts-expect-error no declaration file
import importPlugin from 'eslint-plugin-import';

const importRules = {
  ...importPlugin.flatConfigs.recommended.rules,
  ...importPlugin.flatConfigs.typescript.rules,
  'import/extensions': ['error', 'never', { ignorePackages: true, json: 'always', svg: 'always' }],
  'import/no-mutable-exports': ['error'],
  'import/no-empty-named-blocks': ['error'],

  'import/default': ['error'],
  'import/dynamic-import-chunkname': [
    'off',
    {
      importFunctions: [],
      webpackChunknameFormat: '[0-9a-zA-Z-_/.]+',
    },
  ],
  'import/exports-last': ['off'],
  'import/first': ['error'],
  'import/group-exports': ['off'],
  'import/imports-first': ['off'],
  'import/max-dependencies': [
    'off',
    {
      max: 10,
    },
  ],
  'import/newline-after-import': ['error'],
  'import/no-absolute-path': ['error'],
  'import/no-amd': ['error'],
  'import/no-anonymous-default-export': [
    'off',
    {
      allowAnonymousClass: false,
      allowAnonymousFunction: false,
      allowArray: false,
      allowArrowFunction: false,
      allowLiteral: false,
      allowObject: false,
    },
  ],
  'import/no-commonjs': ['off'],
  'import/no-cycle': [
    'error',
    {
      allowUnsafeDynamicCyclicDependency: false,
      ignoreExternal: false,
      maxDepth: '∞',
    },
  ],
  'import/no-default-export': ['off'],
  'import/no-deprecated': ['off'],
  'import/no-dynamic-require': ['error'],
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: [
        'test/**',
        'tests/**',
        'spec/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        'test.{js,jsx}',
        'test.{ts,tsx}',
        'test-*.{js,jsx}',
        'test-*.{ts,tsx}',
        '**/*{.,_}{test,spec}.{js,jsx}',
        '**/*{.,_}{test,spec}.{ts,tsx}',
        '**/jest.config.js',
        '**/jest.config.ts',
        '**/jest.setup.js',
        '**/jest.setup.ts',
        '**/vue.config.js',
        '**/vue.config.ts',
        '**/webpack.config.js',
        '**/webpack.config.ts',
        '**/webpack.config.*.js',
        '**/webpack.config.*.ts',
        '**/rollup.config.js',
        '**/rollup.config.ts',
        '**/rollup.config.*.js',
        '**/rollup.config.*.ts',
        '**/gulpfile.js',
        '**/gulpfile.ts',
        '**/gulpfile.*.js',
        '**/gulpfile.*.ts',
        '**/Gruntfile{,.js}',
        '**/Gruntfile{,.ts}',
        '**/protractor.conf.js',
        '**/protractor.conf.ts',
        '**/protractor.conf.*.js',
        '**/protractor.conf.*.ts',
        '**/karma.conf.js',
        '**/karma.conf.ts',
        '**/.eslintrc.js',
        '**/.eslintrc.ts',
      ],
      optionalDependencies: false,
    },
  ],
  'import/no-import-module-exports': [
    'error',
    {
      exceptions: [],
    },
  ],
  'import/no-internal-modules': [
    'off',
    {
      allow: [],
    },
  ],
  'import/no-named-default': ['error'],
  'import/no-named-export': ['off'],
  'import/no-namespace': ['off'],
  'import/no-nodejs-modules': ['off'],
  'import/no-relative-packages': ['error'],
  'import/no-relative-parent-imports': ['off'],
  'import/no-restricted-paths': ['off'],
  'import/no-self-import': ['error'],
  'import/no-unassigned-import': ['off'],
  'import/no-unresolved': [
    'error',
    {
      caseSensitive: true,
      caseSensitiveStrict: false,
      commonjs: true,
    },
  ],
  'import/no-unused-modules': [
    'off',
    {
      ignoreExports: [],
      missingExports: true,
      unusedExports: true,
    },
  ],
  'import/no-useless-path-segments': [
    'error',
    {
      commonjs: true,
    },
  ],
  'import/no-webpack-loader-syntax': ['error'],
  'import/order': [
    'error',
    {
      distinctGroup: true,
      groups: [['builtin', 'external', 'internal']],
      warnOnUnassignedImports: false,
    },
  ],
  'import/prefer-default-export': ['error'],
  'import/unambiguous': ['off'],
};

export default {
  plugins: { import: importPlugin },
  settings: {
    'import/resolver': {
      typescript: true, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  rules: importRules,
};
