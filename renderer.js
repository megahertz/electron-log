'use strict';

module.exports = null;

var ipcRenderer;
try {
  ipcRenderer = require('electron').ipcRenderer;
} catch (e) {
  ipcRenderer = null;
}

var originalConsole = require('./lib/original-console');

if (ipcRenderer) {
  module.exports = {
    error:   log.bind(null, 'error'),
    warn:    log.bind(null, 'warn'),
    info:    log.bind(null, 'info'),
    verbose: log.bind(null, 'verbose'),
    debug:   log.bind(null, 'debug'),
    silly:   log.bind(null, 'silly'),
    log:     log.bind(null, 'info')
  };

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
