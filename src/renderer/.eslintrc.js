'use strict';

module.exports = {
  env: {
    browser: true,
  },

  globals: {
    __electronLog: true,
  },

  rules: {
    'no-underscore-dangle': ['error', {
      allow: ['__electronLog'],
    }],
  },
};
