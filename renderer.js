'use strict';

module.exports = null;

var ipcRenderer;
try {
  ipcRenderer = require('electron').ipcRenderer;
} catch (e) {
  ipcRenderer = null;
}

if (ipcRenderer) {
  module.exports = {
    error:   log.bind(null, 'error'),
    warn:    log.bind(null, 'warn'),
    info:    log.bind(null, 'info'),
    verbose: log.bind(null, 'verbose'),
    debug:   log.bind(null, 'debug'),
    silly:   log.bind(null, 'silly')
  };

  ipcRenderer.on('__ELECTRON_LOG_RENDERER__', function(event, level, text) {
    console[level](text);
  });
}

function log() {
  var data = Array.prototype.slice.call(arguments);
  ipcRenderer.send('__ELECTRON_LOG__', data);
}