'use strict';

module.exports = null;

var ipcRenderer;

if (typeof window !== 'undefined' && typeof window.require === 'function') {
  try {
    var electron = window.require('electron');
    ipcRenderer = electron.ipcRenderer;

    if (ipcRenderer) {
      module.exports = {
        error:   log.bind(null, 'error'),
        warn:    log.bind(null, 'warn'),
        info:    log.bind(null, 'info'),
        verbose: log.bind(null, 'verbose'),
        debug:   log.bind(null, 'debug'),
        silly:   log.bind(null, 'silly')
      };
    }

  } catch (e) {
    ipcRenderer = null;
  }
}


function log() {
  var data = Array.prototype.slice.call(arguments);
  ipcRenderer.send('__ELECTRON_LOG__', data);
}