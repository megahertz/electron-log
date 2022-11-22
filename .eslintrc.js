'use strict';

module.exports = {
  extends: 'airbnb-base',
  env: {
    es6: true,
    jasmine: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },

  ignorePatterns: [
    '**/dist/**',
    '**/node_modules/**',
  ],

  rules: {
    'arrow-body-style': 'off',
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'quote-props': ['error', 'consistent-as-needed'],
    'func-names': 'off',
    'import/no-extraneous-dependencies': 'off',
    'lines-between-class-members': ['error', 'always', {
      exceptAfterSingleLine: true,
    }],
    'max-len': ['error', { code: 80 }],
    'no-continue': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'no-unused-expressions': 'off',
    'no-use-before-define': 'off',
    'object-curly-newline': 'off',
    'prefer-destructuring': 'off',
    'semi': ['error', 'always', { omitLastInOneLineBlock: true }],
    'strict': ['error', 'global'],
    'vars-on-top': 'off',
  },
};
