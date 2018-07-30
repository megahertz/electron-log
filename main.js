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

var ELECTRON_LOG_LABEL = '';

module.exports = {
  transports: transports,
  error:      log.bind(null, transports, 'error', getLabel),
  warn:       log.bind(null, transports, 'warn', getLabel),
  info:       log.bind(null, transports, 'info', getLabel),
  verbose:    log.bind(null, transports, 'verbose', getLabel),
  debug:      log.bind(null, transports, 'debug', getLabel),
  silly:      log.bind(null, transports, 'silly', getLabel),
  log:        log.bind(null, transports, 'info', getLabel),
  setLabel:   (label) => { ELECTRON_LOG_LABEL = label; }
};

module.exports.default = module.exports;

if (electron && electron.ipcMain) {
  electron.ipcMain.on('__ELECTRON_LOG__', onRendererLog);
  var appName = electron.app.getName();
  if (appName !== 'Electron') {
    transportFile.appName = appName;
  }
}

function getLabel() {
  return ELECTRON_LOG_LABEL;
}

function onRendererLog(event, data, label) {

  function getRendererLabel() { return label; }

  if (Array.isArray(data)) {
    data.unshift(transports);
    data.splice(2, 0, getRendererLabel);
    log.apply(null, data);
  }
}
