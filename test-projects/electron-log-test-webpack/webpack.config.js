'use strict';

const path = require('path');

module.exports = [
  {
    mode: "development",
    entry: ['./src/main.js'],
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist')
    },
    target: 'electron-main',
    module: {
      rules: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [require('babel-preset-latest')]
          }
        }
      ]
    },
    node: {
      __dirname: false
    }
  },
  {
    mode: "development",
    entry: ['./src/renderer.js'],
    output: {
      filename: 'renderer.js',
      path: path.resolve(__dirname, 'dist')
    },
    target: 'electron-renderer',
    module: {
      rules: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [require('babel-preset-latest')]
          }
        }
      ]
    }
  }
];
