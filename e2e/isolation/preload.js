'use strict';

var electron = require('electron');

var exposed = {};
['error', 'warn', 'info', 'verbose', 'debug', 'silly'].forEach(
  function (method) {
    exposed[method] = function () {
      electron.ipcRenderer.send(
        'electron-log',
        method,
        Array.prototype.slice.call(arguments)
      );
    };
  }
);

electron.contextBridge.exposeInMainWorld('log', exposed);
