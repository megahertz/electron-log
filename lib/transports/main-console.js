'use strict';

var format = require('../format');

var electron;
try {
  electron = require('electron');
} catch (e) {
  electron = {};
}

var IPC_EVENT = '__ELECTRON_LOG_MAIN_CONSOLE__';

module.exports = mainConsoleTransportFactory;

function mainConsoleTransportFactory(electronLog) {
  transport.level  = false;
  transport.format = '[{h}:{i}:{s}.{ms}] {text}';

  if (electron.ipcMain) {
    electron.ipcMain.on(IPC_EVENT, function (event, msg) {
      electronLog.transports.console(msg);
    });
  }

  return process.type === 'renderer' ? transport : null;

  function transport(msg) {
    if (!electron.ipcRenderer) return;

    msg.data = msg.data.map(format.stringifyObject);
    electron.ipcRenderer.send(IPC_EVENT, msg);
  }
}
