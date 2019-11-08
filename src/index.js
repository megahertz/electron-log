'use strict';

var catchErrors               = require('./catchErrors');
var log                       = require('./log');
var transportConsole          = require('./transports/console');
var transportFile             = require('./transports/file');
var transportRemote           = require('./transports/remote');
var transportMainConsole      = require('./transports/mainConsole');
var transportRendererConsole  = require('./transports/rendererConsole');
var utils                     = require('./utils');

module.exports = {
  catchErrors: function callCatchErrors(options) {
    var opts = Object.assign({}, {
      log: module.exports.error,
      showDialog: process.type === 'browser'
    }, options || {});

    catchErrors(opts);
  },
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
  remote: transportRemote(module.exports),
  mainConsole: transportMainConsole(module.exports),
  rendererConsole: transportRendererConsole(module.exports)
};

module.exports.levels.forEach(function (level) {
  module.exports[level] = log.bind(null, module.exports, level);
});

module.exports.log = log.bind(null, module.exports, 'info');

module.exports.default = module.exports;
