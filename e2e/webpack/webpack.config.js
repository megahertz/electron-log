'use strict';

var path = require('path');

module.exports = [
  {
    mode: 'development',
    entry: ['./src/main.js'],
    output: { filename: 'main.js' },
    target: 'electron-main',
    node: {
      __dirname: false,
    },
    resolve: {
      alias: {
        'electron-log': path.resolve('../..'),
      },
    },
    stats: 'minimal',
  },
  {
    mode: 'development',
    entry: ['./src/renderer.js'],
    output: { filename: 'renderer.js' },
    target: 'electron-renderer',
    resolve: {
      alias: {
        'electron-log': path.resolve('../..'),
      },
    },
    stats: 'minimal',
  },
];
