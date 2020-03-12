'use strict';

var catchErrors = require('./catchErrors');
var electronApi = require('./electronApi');
var log = require('./log').log;
var scopeFactory = require('./scope');
var transportConsole = require('./transports/console');
var transportFile = require('./transports/file');
var transportIpc = require('./transports/ipc');
var transportRemote = require('./transports/remote');

module.exports = create('default');
module.exports.default = module.exports;

/**
 * @param {string} logId
 * @return {ElectronLog.ElectronLog}
 */
function create(logId) {
  /**
   * @type {ElectronLog.ElectronLog}
   */
  var instance = {
    catchErrors: function callCatchErrors(options) {
      var opts = Object.assign({}, {
        log: instance.error,
        showDialog: process.type === 'browser',
      }, options || {});

      catchErrors(opts);
    },
    create: create,
    functions: {},
    hooks: [],
    isDev: electronApi.isDev(),
    levels: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
    logId: logId,
    variables: {
      processType: process.type,
    },
  };

  instance.scope = scopeFactory(instance);

  instance.transports = {
    console: transportConsole(instance),
    file: transportFile(instance),
    remote: transportRemote(instance),
    ipc: transportIpc(instance),
  };

  instance.levels.forEach(function (level) {
    instance[level] = log.bind(null, instance, { level: level });
    instance.functions[level] = instance[level];
  });

  instance.log = log.bind(null, instance, { level: 'info' });
  instance.functions.log = instance.log;

  return instance;
}
