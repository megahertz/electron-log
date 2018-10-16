'use strict';

var electron;
try {
  electron = require('electron');
} catch (e) {
  electron = null;
}

var log                      = require('./lib/log');
var transportConsole         = require('./lib/transports/console');
var transportFile            = require('./lib/transports/file');
var transportLogS            = require('./lib/transports/log-s');
var transportRendererConsole = require('./lib/transports/renderer-console');

var transports = {
  console: transportConsole,
  file: transportFile,
  logS: transportLogS,
  rendererConsole: transportRendererConsole
};

var namedLoggers = {};

module.exports = Object.assign(
  {
    transports: transports,
    createNamedLogger: createNamedLogger
  },
  createLogFunctions(transports, '')
);

module.exports.default = module.exports;

function createLogFunctions(transports, prependMessage) {
  return {
    error:    log.bind(null, transports, 'error', prependMessage),
    warn:     log.bind(null, transports, 'warn', prependMessage),
    info:     log.bind(null, transports, 'info', prependMessage),
    verbose:  log.bind(null, transports, 'verbose', prependMessage),
    debug:    log.bind(null, transports, 'debug', prependMessage),
    silly:    log.bind(null, transports, 'silly', prependMessage),
    log:      log.bind(null, transports, 'info', prependMessage)
  }
}

if (electron && electron.ipcMain) {
  electron.ipcMain.on('__ELECTRON_LOG__', onRendererLog);
  var appName = electron.app.getName();
  if (appName !== 'Electron') {
    transportFile.appName = appName;
  }
}

function onRendererLog(event, data) {
  if (Array.isArray(data)) {
    data.unshift(transports);
    log.apply(null, data);
  }
}

function createNamedLogger(name) {
  if (!namedLoggers[name]) {
    namedLoggers[name] = createLogFunctions(Object.assign({}, transports), name + ':');
  }

  return namedLoggers[name];
}
