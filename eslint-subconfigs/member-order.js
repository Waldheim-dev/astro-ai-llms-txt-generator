import tseslint from 'typescript-eslint';

const memberOrder = [
  // Index signature
  'signature',
  'call-signature',

  // Fields
  'public-static-field',
  'protected-static-field',
  'private-static-field',
  '#private-static-field',

  'public-decorated-field',
  'protected-decorated-field',
  'private-decorated-field',

  'public-instance-field',
  'protected-instance-field',
  'private-instance-field',
  '#private-instance-field',

  'public-abstract-field',
  'protected-abstract-field',

  'public-field',
  'protected-field',
  'private-field',
  '#private-field',

  'static-field',
  'instance-field',
  'abstract-field',

  'decorated-field',

  'field',

  // Accessors
  'public-static-accessor',
  'protected-static-accessor',
  'private-static-accessor',
  '#private-static-accessor',

  'public-decorated-accessor',
  'protected-decorated-accessor',
  'private-decorated-accessor',

  'public-instance-accessor',
  'protected-instance-accessor',
  'private-instance-accessor',
  '#private-instance-accessor',

  'public-abstract-accessor',
  'protected-abstract-accessor',

  'public-accessor',
  'protected-accessor',
  'private-accessor',
  '#private-accessor',

  'static-accessor',
  'instance-accessor',
  'abstract-accessor',

  'decorated-accessor',

  'accessor',

  ['static-get', 'static-set'],
  ['instance-get', 'instance-set'],
  ['get', 'set'],

  // Static initialization
  'static-initialization',

  // Constructors
  'public-constructor',
  'protected-constructor',
  'private-constructor',
  'constructor',

  // Methods
  'public-static-method',
  'protected-static-method',
  'private-static-method',
  '#private-static-method',

  'public-decorated-method',
  'protected-decorated-method',
  'private-decorated-method',

  'public-instance-method',
  'protected-instance-method',
  'private-instance-method',
  '#private-instance-method',

  'public-abstract-method',
  'protected-abstract-method',

  'public-method',
  'protected-method',
  'private-method',
  '#private-method',

  'static-method',
  'instance-method',
  'abstract-method',

  'decorated-method',

  'method',
];

// eslint-disable-next-line jsdoc/check-tag-names
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} */
export default {
  plugins: { '@typescript-eslint': tseslint.plugin },
  rules: {
    '@typescript-eslint/member-ordering': ['error', { default: memberOrder }],
    'grouped-accessor-pairs': ['error', 'getBeforeSet'],
  },
};
