/* eslint-disable max-lines */
// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Rules} */
const eslintRules = {
  'accessor-pairs': ['off'],
  'array-bracket-newline': [0, 'consistent'],
  'array-bracket-spacing': [0, 'never'],
  'array-callback-return': [
    'error',
    {
      allowImplicit: true,
      allowVoid: false,
      checkForEach: false,
    },
  ],
  'array-element-newline': [
    0,
    {
      minItems: 3,
      multiline: true,
    },
  ],
  'arrow-body-style': [
    'off',
    'as-needed',
    {
      requireReturnForObjectLiteral: false,
    },
  ],
  'arrow-parens': [0, 'always'],
  'arrow-spacing': [
    0,
    {
      after: true,
      before: true,
    },
  ],
  'block-scoped-var': ['error'],
  'block-spacing': [0, 'always'],
  'brace-style': [
    0,
    '1tbs',
    {
      allowSingleLine: true,
    },
  ],
  'callback-return': ['off'],
  camelcase: [
    'off',
    {
      ignoreDestructuring: false,
      ignoreGlobals: false,
      ignoreImports: false,
      properties: 'never',
    },
  ],
  'capitalized-comments': [
    'off',
    'never',
    {
      block: {
        ignoreConsecutiveComments: true,
        ignoreInlineComments: true,
        ignorePattern: '.*',
      },
      line: {
        ignoreConsecutiveComments: true,
        ignoreInlineComments: true,
        ignorePattern: '.*',
      },
    },
  ],
  'class-methods-use-this': [
    'error',
    {
      enforceForClassFields: true,
      exceptMethods: [],
    },
  ],
  'comma-dangle': [
    0,
    {
      arrays: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
      imports: 'always-multiline',
      objects: 'always-multiline',
    },
  ],
  'comma-spacing': [
    0,
    {
      after: true,
      before: false,
    },
  ],
  'comma-style': [
    0,
    'last',
    {
      exceptions: {
        ArrayExpression: false,
        ArrayPattern: false,
        ArrowFunctionExpression: false,
        CallExpression: false,
        FunctionDeclaration: false,
        FunctionExpression: false,
        ImportDeclaration: false,
        NewExpression: false,
        ObjectExpression: false,
        ObjectPattern: false,
        VariableDeclaration: false,
      },
    },
  ],
  complexity: ['off', 20],
  'computed-property-spacing': [0, 'never'],
  'consistent-return': ['error'],
  'consistent-this': ['off'],
  'constructor-super': ['off'],
  curly: ['error', 'multi-line'],
  'default-case': [
    'error',
    {
      commentPattern: '^no default$',
    },
  ],
  'default-case-last': ['error'],
  'default-param-last': ['off'],
  'dot-location': [0, 'property'],
  'dot-notation': [
    'off',
    {
      allowIndexSignaturePropertyAccess: false,
      allowKeywords: true,
      allowPattern: '',
      allowPrivateClassPropertyAccess: false,
      allowProtectedClassPropertyAccess: false,
    },
  ],
  'eol-last': [0, 'always'],
  eqeqeq: [
    'error',
    'always',
    {
      null: 'ignore',
    },
  ],
  'func-call-spacing': [0, 'never'],
  'func-name-matching': [
    'off',
    'always',
    {
      considerPropertyDescriptor: true,
      includeCommonJSModuleExports: false,
    },
  ],
  'func-names': ['warn'],
  'func-style': ['off', 'expression'],
  'function-call-argument-newline': [0, 'consistent'],
  'function-paren-newline': [0, 'multiline-arguments'],
  'generator-star-spacing': [
    0,
    {
      after: true,
      before: false,
    },
  ],
  'getter-return': [
    'off',
    {
      allowImplicit: true,
    },
  ],
  'guard-for-in': ['error'],
  'handle-callback-err': ['off'],
  'id-denylist': ['off'],
  'id-length': ['off'],
  'id-match': ['off'],
  'implicit-arrow-linebreak': [0, 'beside'],

  indent: [
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
  'init-declarations': ['off'],
  'jsx-quotes': [0, 'prefer-double'],
  'key-spacing': [
    0,
    {
      afterColon: true,
      beforeColon: false,
    },
  ],
  'keyword-spacing': [
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
  'line-comment-position': [
    'off',
    {
      applyDefaultPatterns: true,
      ignorePattern: '',
      position: 'above',
    },
  ],
  'linebreak-style': [0, 'unix'],
  'lines-around-directive': [
    'off',
    {
      after: 'always',
      before: 'always',
    },
  ],
  'lines-between-class-members': [
    0,
    'always',
    {
      exceptAfterOverload: true,
      exceptAfterSingleLine: false,
    },
  ],
  'max-classes-per-file': ['error', 1],
  'max-depth': ['off', 4],
  'max-len': [
    0,
    100,
    2,
    {
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreUrls: true,
    },
  ],
  'max-lines-per-function': [
    'off',
    {
      IIFEs: true,
      max: 50,
      skipBlankLines: true,
      skipComments: true,
    },
  ],
  'max-nested-callbacks': ['off'],
  'max-params': ['off', 3],
  'max-statements': ['off', 10],
  'max-statements-per-line': [
    0,
    {
      max: 1,
    },
  ],
  'multiline-comment-style': ['off', 'starred-block'],
  'multiline-ternary': [0, 'never'],
  'new-cap': [
    'error',
    {
      capIsNew: false,
      capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
      newIsCap: true,
      newIsCapExceptions: [],
      properties: true,
    },
  ],
  'newline-after-var': ['off'],
  'newline-before-return': ['off'],
  'newline-per-chained-call': [
    0,
    {
      ignoreChainWithDepth: 4,
    },
  ],
  'no-alert': ['warn'],
  'no-await-in-loop': ['error'],
  'no-bitwise': ['error'],
  'no-caller': ['error'],
  'no-catch-shadow': ['off'],
  'no-cond-assign': ['error', 'always'],
  'no-confusing-arrow': [
    0,
    {
      allowParens: true,
      onlyOneSimpleParam: false,
    },
  ],
  'no-console': ['warn'],
  'no-constant-condition': ['warn'],
  'no-constructor-return': ['error'],
  'no-continue': ['error'],
  'no-div-regex': ['off'],
  'no-duplicate-imports': ['off'],
  'no-else-return': [
    'error',
    {
      allowElseIf: false,
    },
  ],
  'no-empty-function': [
    'off',
    {
      allow: ['arrowFunctions', 'functions', 'methods'],
    },
  ],
  'no-eq-null': ['off'],
  'no-eval': ['error'],
  'no-extend-native': ['error'],
  'no-extra-bind': ['error'],
  'no-extra-label': ['error'],
  'no-extra-parens': [
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
  'no-global-assign': [
    'error',
    {
      exceptions: [],
    },
  ],
  'no-implicit-coercion': [
    'off',
    {
      allow: [],
      boolean: false,
      number: true,
      string: true,
    },
  ],
  'no-implicit-globals': ['off'],
  'no-implied-eval': ['off'],
  'no-inline-comments': ['off'],
  'no-invalid-this': ['off'],
  'no-iterator': ['error'],
  'no-label-var': ['error'],
  'no-labels': [
    'error',
    {
      allowLoop: false,
      allowSwitch: false,
    },
  ],
  'no-lone-blocks': ['error'],
  'no-lonely-if': ['error'],
  'no-loop-func': ['off'],
  'no-magic-numbers': [
    'off',
    {
      detectObjects: false,
      enforceConst: true,
      ignore: [],
      ignoreArrayIndexes: true,
    },
  ],
  'no-mixed-operators': [
    0,
    {
      allowSamePrecedence: false,
      groups: [
        ['%', '**'],
        ['%', '+'],
        ['%', '-'],
        ['%', '*'],
        ['%', '/'],
        ['/', '*'],
        ['&', '|', '<<', '>>', '>>>'],
        ['==', '!=', '===', '!=='],
        ['&&', '||'],
      ],
    },
  ],
  'no-mixed-requires': ['off', false],
  'no-multi-assign': ['error'],
  'no-multi-spaces': [
    0,
    {
      ignoreEOLComments: false,
    },
  ],
  'no-multi-str': ['error'],
  'no-multiple-empty-lines': [
    0,
    {
      max: 1,
      maxBOF: 0,
      maxEOF: 0,
    },
  ],
  'no-native-reassign': ['off'],
  'no-negated-condition': ['off'],
  'no-negated-in-lhs': ['off'],
  'no-nested-ternary': ['error'],
  'no-new': ['error'],
  'no-new-func': ['off'],
  'no-new-wrappers': ['error'],
  'no-octal-escape': ['error'],
  'no-param-reassign': [
    'error',
    {
      ignorePropertyModificationsFor: [
        'acc',
        'accumulator',
        'e',
        'ctx',
        'context',
        'req',
        'request',
        'res',
        'response',
        '$scope',
        'staticContext',
      ],
      props: true,
    },
  ],
  'no-plusplus': ['error'],
  'no-process-env': ['off'],
  'no-process-exit': ['off'],
  'no-promise-executor-return': ['error'],
  'no-proto': ['error'],
  'no-restricted-exports': [
    'error',
    {
      restrictedNamedExports: ['default', 'then'],
    },
  ],
  'no-restricted-globals': [
    'error',
    {
      message:
        'Use Number.isFinite instead https://github.com/airbnb/javascript#standard-library--isfinite',
      name: 'isFinite',
    },
    {
      message:
        'Use Number.isNaN instead https://github.com/airbnb/javascript#standard-library--isnan',
      name: 'isNaN',
    },
    'addEventListener',
    'blur',
    'close',
    'closed',
    'confirm',
    'defaultStatus',
    'defaultstatus',
    'event',
    'external',
    'find',
    'focus',
    'frameElement',
    'frames',
    'history',
    'innerHeight',
    'innerWidth',
    'length',
    'location',
    'locationbar',
    'menubar',
    'moveBy',
    'moveTo',
    'name',
    'onblur',
    'onerror',
    'onfocus',
    'onload',
    'onresize',
    'onunload',
    'open',
    'opener',
    'opera',
    'outerHeight',
    'outerWidth',
    'pageXOffset',
    'pageYOffset',
    'parent',
    'print',
    'removeEventListener',
    'resizeBy',
    'resizeTo',
    'screen',
    'screenLeft',
    'screenTop',
    'screenX',
    'screenY',
    'scroll',
    'scrollbars',
    'scrollBy',
    'scrollTo',
    'scrollX',
    'scrollY',
    'self',
    'status',
    'statusbar',
    'stop',
    'toolbar',
    'top',
  ],
  'no-restricted-imports': [
    'off',
    {
      paths: [],
      patterns: [],
    },
  ],
  'no-restricted-modules': ['off'],
  'no-restricted-properties': [
    'error',
    {
      message: 'arguments.callee is deprecated',
      object: 'arguments',
      property: 'callee',
    },
    {
      message: 'Please use Number.isFinite instead',
      object: 'global',
      property: 'isFinite',
    },
    {
      message: 'Please use Number.isFinite instead',
      object: 'self',
      property: 'isFinite',
    },
    {
      message: 'Please use Number.isFinite instead',
      object: 'window',
      property: 'isFinite',
    },
    {
      message: 'Please use Number.isNaN instead',
      object: 'global',
      property: 'isNaN',
    },
    {
      message: 'Please use Number.isNaN instead',
      object: 'self',
      property: 'isNaN',
    },
    {
      message: 'Please use Number.isNaN instead',
      object: 'window',
      property: 'isNaN',
    },
    {
      message: 'Please use Object.defineProperty instead.',
      property: '__defineGetter__',
    },
    {
      message: 'Please use Object.defineProperty instead.',
      property: '__defineSetter__',
    },
    {
      message: 'Use the exponentiation operator (**) instead.',
      object: 'Math',
      property: 'pow',
    },
  ],
  'no-restricted-syntax': [
    'warn',
    {
      message:
        'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      selector: 'ForInStatement',
    },
    {
      message:
        'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
      selector: 'ForOfStatement',
    },
    {
      message:
        'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      selector: 'LabeledStatement',
    },
    {
      message:
        '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      selector: 'WithStatement',
    },
  ],
  'no-return-assign': ['error', 'always'],
  'no-return-await': ['off'],
  'no-script-url': ['error'],
  'no-self-assign': [
    'error',
    {
      props: true,
    },
  ],
  'no-self-compare': ['error'],
  'no-sequences': ['error'],
  'no-shadow': ['off'],
  'no-sync': ['off'],
  'no-template-curly-in-string': ['error'],
  'no-ternary': ['off'],
  'no-throw-literal': ['off'],
  'no-trailing-spaces': [
    0,
    {
      ignoreComments: false,
      skipBlankLines: false,
    },
  ],
  'no-undef-init': ['error'],
  'no-undefined': ['off'],
  'no-underscore-dangle': [
    'error',
    {
      allow: [],
      allowAfterSuper: false,
      allowAfterThis: false,
      allowAfterThisConstructor: false,
      allowFunctionParams: true,
      allowInArrayDestructuring: true,
      allowInObjectDestructuring: true,
      enforceInClassFields: false,
      enforceInMethodNames: true,
    },
  ],
  'no-unmodified-loop-condition': ['off'],
  'no-unneeded-ternary': [
    'error',
    {
      defaultAssignment: false,
    },
  ],
  'no-unreachable-loop': [
    'error',
    {
      ignore: [],
    },
  ],
  'no-unsafe-optional-chaining': [
    'error',
    {
      disallowArithmeticOperators: true,
    },
  ],
  'no-unused-expressions': [
    'error',
    {
      allowShortCircuit: false,
      allowTaggedTemplates: false,
      allowTernary: false,
      enforceForJSX: false,
    },
  ],
  'no-unused-private-class-members': ['off'],
  'no-unused-vars': [
    'off',
    {
      args: 'after-used',
      ignoreRestSiblings: true,
      vars: 'all',
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_',
    },
  ],
  'no-use-before-define': [
    'off',
    {
      classes: true,
      functions: true,
      variables: true,
    },
  ],
  'no-useless-call': ['off'],
  'no-useless-computed-key': ['error'],
  'no-useless-concat': ['error'],
  'no-useless-constructor': ['off'],
  'no-useless-rename': [
    'error',
    {
      ignoreDestructuring: false,
      ignoreExport: false,
      ignoreImport: false,
    },
  ],
  'no-useless-return': ['error'],
  'no-void': ['error'],
  'nonblock-statement-body-position': [
    0,
    'beside',
    {
      overrides: {},
    },
  ],
  'object-curly-newline': [
    0,
    {
      ExportDeclaration: {
        consistent: true,
        minProperties: 4,
        multiline: true,
      },
      ImportDeclaration: {
        consistent: true,
        minProperties: 4,
        multiline: true,
      },
      ObjectExpression: {
        consistent: true,
        minProperties: 4,
        multiline: true,
      },
      ObjectPattern: {
        consistent: true,
        minProperties: 4,
        multiline: true,
      },
    },
  ],
  'object-curly-spacing': [0, 'always'],
  'object-property-newline': [
    0,
    {
      allowAllPropertiesOnSameLine: true,
      allowMultiplePropertiesPerLine: false,
    },
  ],
  'object-shorthand': [
    'error',
    'always',
    {
      avoidQuotes: true,
      ignoreConstructors: false,
    },
  ],
  'one-var': ['error', 'never'],
  'one-var-declaration-per-line': [0, 'always'],
  'operator-assignment': ['error', 'always'],
  'operator-linebreak': [
    0,
    'before',
    {
      overrides: {
        '=': 'none',
      },
    },
  ],
  'padded-blocks': [
    0,
    {
      blocks: 'never',
      classes: 'never',
      switches: 'never',
    },
    {
      allowSingleLineBlocks: true,
    },
  ],
  'prefer-arrow-callback': [
    'off',
    {
      allowNamedFunctions: false,
      allowUnboundThis: true,
    },
  ],
  'prefer-const': [
    'error',
    {
      destructuring: 'any',
      ignoreReadBeforeAssign: true,
    },
  ],
  'prefer-destructuring': [
    'error',
    {
      AssignmentExpression: {
        array: true,
        object: false,
      },
      VariableDeclarator: {
        array: false,
        object: true,
      },
    },
    {
      enforceForRenamedProperties: false,
    },
  ],
  'prefer-exponentiation-operator': ['error'],
  'prefer-named-capture-group': ['off'],
  'prefer-numeric-literals': ['error'],
  'prefer-object-spread': ['error'],
  'prefer-promise-reject-errors': [
    'error',
    {
      allowEmptyReject: true,
    },
  ],
  'prefer-reflect': ['off'],
  'prefer-regex-literals': [
    'error',
    {
      disallowRedundantWrapping: true,
    },
  ],
  'prefer-template': ['error'],
  'quote-props': [
    0,
    'as-needed',
    {
      keywords: false,
      numbers: false,
      unnecessary: true,
    },
  ],
  quotes: [
    0,
    'single',
    {
      avoidEscape: true,
    },
  ],
  radix: ['error'],
  'require-atomic-updates': ['off'],
  'require-await': ['off'],
  'require-jsdoc': ['off'],
  'require-unicode-regexp': ['off'],
  'rest-spread-spacing': [0, 'never'],
  semi: [0, 'always'],
  'semi-spacing': [
    0,
    {
      after: true,
      before: false,
    },
  ],
  'semi-style': [0, 'last'],
  'sort-imports': [
    'off',
    {
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    },
  ],
  'sort-keys': [
    'off',
    'asc',
    {
      caseSensitive: false,
      natural: true,
    },
  ],
  'sort-vars': ['off'],
  'space-before-function-paren': [
    0,
    {
      anonymous: 'always',
      asyncArrow: 'always',
      named: 'never',
    },
  ],
  'space-in-parens': [0, 'never'],
  'space-unary-ops': [
    0,
    {
      nonwords: false,
      overrides: {},
      words: true,
    },
  ],
  'spaced-comment': [
    0,
    'always',
    {
      block: {
        balanced: true,
        exceptions: ['-', '+'],
        markers: ['=', '!', ':', '::'],
      },
      line: {
        exceptions: ['-', '+'],
        markers: ['=', '!', '/'],
      },
    },
  ],
  strict: ['error', 'never'],
  'switch-colon-spacing': [
    0,
    {
      after: true,
      before: false,
    },
  ],
  'symbol-description': ['error'],
  'template-tag-spacing': [0, 'never'],
  'unicode-bom': ['error', 'never'],
  'valid-jsdoc': ['off'],
  'valid-typeof': [
    'off',
    {
      requireStringLiterals: true,
    },
  ],
  'vars-on-top': ['error'],
  'wrap-iife': [
    0,
    'outside',
    {
      functionPrototypeMethods: false,
    },
  ],
  'yield-star-spacing': [0, 'after'],
  yoda: ['error'],
};

// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} */
export default {
  rules: { ...eslintRules },
};
