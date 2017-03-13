'use strict';

var log              = require('./lib/log');
var transportConsole = require('./lib/transports/console');
var transportFile    = require('./lib/transports/file');

module.exports.transports = {
  console: transportConsole,
  file: transportFile
};

module.exports.error   = log.bind(null, module.exports.transports, 'error');
module.exports.warn    = log.bind(null, module.exports.transports, 'warn');
module.exports.info    = log.bind(null, module.exports.transports, 'info');
module.exports.verbose = log.bind(null, module.exports.transports, 'verbose');
module.exports.debug   = log.bind(null, module.exports.transports, 'debug');
module.exports.silly   = log.bind(null, module.exports.transports, 'silly');