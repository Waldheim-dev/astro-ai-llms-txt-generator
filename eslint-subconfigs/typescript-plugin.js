import tseslint from 'typescript-eslint';

// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Rules} */
const tsRules = {
  '@typescript-eslint/naming-convention': [
    'error',
    {
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      selector: 'variable',
    },
    {
      format: ['camelCase', 'PascalCase'],
      selector: 'function',
    },
    {
      format: ['PascalCase'],
      selector: 'typeLike',
    },
  ],
  '@typescript-eslint/brace-style': [
    0,
    '1tbs',
    {
      allowSingleLine: true,
    },
  ],
  '@typescript-eslint/comma-dangle': [
    0,
    {
      arrays: 'always-multiline',
      enums: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
      generics: 'always-multiline',
      imports: 'always-multiline',
      objects: 'always-multiline',
      tuples: 'always-multiline',
    },
  ],
  '@typescript-eslint/comma-spacing': [
    0,
    {
      after: true,
      before: false,
    },
  ],

  '@typescript-eslint/default-param-last': ['error'],
  '@typescript-eslint/dot-notation': [
    'error',
    {
      allowIndexSignaturePropertyAccess: false,
      allowKeywords: true,
      allowPattern: '',
      allowPrivateClassPropertyAccess: false,
      allowProtectedClassPropertyAccess: false,
    },
  ],

  '@typescript-eslint/func-call-spacing': [0, 'never'],
  '@typescript-eslint/indent': [
    0,
    2,
    {
      ArrayExpression: 1,
      CallExpression: {
        arguments: 1,
      },
      FunctionDeclaration: {
        body: 1,
        parameters: 1,
      },
      FunctionExpression: {
        body: 1,
        parameters: 1,
      },
      ImportDeclaration: 1,
      ObjectExpression: 1,
      SwitchCase: 1,
      VariableDeclarator: 1,
      flatTernaryExpressions: false,
      ignoreComments: false,
      ignoredNodes: [
        'JSXElement',
        'JSXElement > *',
        'JSXAttribute',
        'JSXIdentifier',
        'JSXNamespacedName',
        'JSXMemberExpression',
        'JSXSpreadAttribute',
        'JSXExpressionContainer',
        'JSXOpeningElement',
        'JSXClosingElement',
        'JSXFragment',
        'JSXOpeningFragment',
        'JSXClosingFragment',
        'JSXText',
        'JSXEmptyExpression',
        'JSXSpreadChild',
      ],
      offsetTernaryExpressions: false,
      outerIIFEBody: 1,
    },
  ],
  '@typescript-eslint/keyword-spacing': [
    0,
    {
      after: true,
      before: true,
      overrides: {
        case: {
          after: true,
        },
        return: {
          after: true,
        },
        throw: {
          after: true,
        },
      },
    },
  ],
  '@typescript-eslint/lines-between-class-members': [
    0,
    'always',
    {
      exceptAfterOverload: true,
      exceptAfterSingleLine: false,
    },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      args: 'after-used',
      ignoreRestSiblings: true,
      vars: 'all',
      varsIgnorePattern: '^_',
    },
  ],

  '@typescript-eslint/no-dupe-class-members': ['error'],

  '@typescript-eslint/no-extra-parens': [
    0,
    'all',
    {
      conditionalAssign: true,
      enforceForArrowConditionals: false,
      ignoreJSX: 'all',
      nestedBinaryExpressions: false,
      returnAssign: false,
    },
  ],

  '@typescript-eslint/no-implied-eval': ['error'],
  '@typescript-eslint/no-loop-func': ['error'],

  '@typescript-eslint/no-empty-function': [
    'error',
    {
      allow: ['arrowFunctions', 'functions', 'methods'],
    },
  ],

  '@typescript-eslint/no-magic-numbers': [
    'off',
    {
      detectObjects: false,
      enforceConst: true,
      ignore: [],
      ignoreArrayIndexes: true,
    },
  ],
  '@typescript-eslint/no-redeclare': ['error'],
  '@typescript-eslint/no-shadow': ['error'],

  '@typescript-eslint/no-unused-expressions': [
    'error',
    {
      allowShortCircuit: false,
      allowTaggedTemplates: false,
      allowTernary: false,
      enforceForJSX: false,
    },
  ],
  '@typescript-eslint/no-use-before-define': [
    'error',
    {
      classes: true,
      functions: true,
      variables: true,
    },
  ],
  '@typescript-eslint/no-useless-constructor': ['error'],
  '@typescript-eslint/object-curly-spacing': [0, 'always'],
  '@typescript-eslint/quotes': [
    0,
    'single',
    {
      avoidEscape: true,
    },
  ],
  '@typescript-eslint/require-await': ['off'],
  '@typescript-eslint/return-await': ['error', 'in-try-catch'],
  '@typescript-eslint/semi': [0, 'always'],
  '@typescript-eslint/space-before-function-paren': [
    0,
    {
      anonymous: 'always',
      asyncArrow: 'always',
      named: 'never',
    },
  ],
};

// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} */
export default {
  plugins: { '@typescript-eslint': tseslint.plugin },
  rules: {
    ...tsRules,
  },
};
