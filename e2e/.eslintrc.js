'use strict';

module.exports = {
  env: {
    browser: true,
  },

  globals: {
    electronLog: true,
  },

  settings: {
    'import/core-modules': ['electron-log'],
  },
};
