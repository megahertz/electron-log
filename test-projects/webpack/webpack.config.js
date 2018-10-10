'use strict';

var presetEnv = require('@babel/preset-env');
var path      = require('path');

module.exports = [
  {
    mode: 'development',
    entry: ['./src/main.js'],
    output: { filename: 'main.js' },
    target: 'electron-main',
    module: {
      rules: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [presetEnv]
          }
        }
      ]
    },
    node: {
      __dirname: false
    },
    resolve: {
      alias: {
        'electron-log': path.resolve('../..')
      }
    }
  },
  {
    mode: 'development',
    entry: ['./src/renderer.js'],
    output: { filename: 'renderer.js' },
    target: 'electron-renderer',
    module: {
      rules: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [presetEnv]
          }
        }
      ]
    },
    resolve: {
      alias: {
        'electron-log': path.resolve('../..')
      }
    }
  }
];
