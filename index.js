'use strict';

var log                       = require('./lib/log');
var transportConsole          = require('./lib/transports/console');
var transportFile             = require('./lib/transports/file');
var transportLogS             = require('./lib/transports/log-s');
var transportMainConsole      = require('./lib/transports/main-console');
var transportRendererConsole  = require('./lib/transports/renderer-console');
var utils                     = require('./lib/utils');

module.exports = {
  hooks: [],
  isDev: utils.isDev(),
  levels: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
  variables: {
    processType: process.type
  }
};

module.exports.transports = {
  console: transportConsole(module.exports),
  file: transportFile(module.exports),
  logS: transportLogS(module.exports),
  mainConsole: transportMainConsole(module.exports),
  rendererConsole: transportRendererConsole(module.exports)
};

module.exports.levels.forEach(function (level) {
  module.exports[level] = log.bind(null, module.exports, level);
});

module.exports.default = module.exports;
