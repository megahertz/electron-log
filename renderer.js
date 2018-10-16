'use strict';

module.exports = null;

var ipcRenderer;
try {
  ipcRenderer = require('electron').ipcRenderer;
} catch (e) {
  ipcRenderer = null;
}

var originalConsole = require('./lib/original-console');

var namedLoggers = {};

if (ipcRenderer) {
  module.exports = createLogFunctions;
  module.exports.createNamedLogger = createNamedLogger;

  module.exports.default = module.exports;

  ipcRenderer.on('__ELECTRON_LOG_RENDERER__', function(event, level, data) {
    if (level === 'verbose') {
      level = 'log';
    } else if (level === 'silly') {
      level = 'debug';
    }

    originalConsole[level].apply(
      originalConsole.context,
      typeof data === 'string' ? [data] : data
    );
  });
}

function createLogFunctions(prependMessage) {
  return {
    error:    log.bind(null, 'error', prependMessage),
    warn:     log.bind(null, 'warn', prependMessage),
    info:     log.bind(null, 'info', prependMessage),
    verbose:  log.bind(null, 'verbose', prependMessage),
    debug:    log.bind(null, 'debug', prependMessage),
    silly:    log.bind(null, 'silly', prependMessage),
    log:      log.bind(null, 'info', prependMessage)
  }
}

function createNamedLogger(name) {
  if (!namedLoggers[name]) {
    namedLoggers[name] = createLogFunctions(transports, name + ':');
  }

  return namedLoggers[name];
}

function log() {
  var data = Array.prototype.slice.call(arguments);

  data = data.map(function(obj) {
    if (obj instanceof Error) {
      obj = obj.stack || obj;
    }

    return obj;
  });

  ipcRenderer.send('__ELECTRON_LOG__', data);
}
