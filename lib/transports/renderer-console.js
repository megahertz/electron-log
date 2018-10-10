'use strict';

var format = require('../format');

var electron;
try {
  electron = require('electron');
} catch (e) {
  electron = {};
}

var IPC_EVENT = '__ELECTRON_LOG_RENDERER_CONSOLE__';

module.exports = renderConsoleTransportFactory;

function renderConsoleTransportFactory(electronLog) {
  transport.level  = false;
  transport.format = '[{h}:{i}:{s}.{ms}] {text}';

  if (electron.ipcRenderer) {
    electron.ipcRenderer.on(IPC_EVENT, function (event, msg) {
      electronLog.transports.console(msg);
    });
  }

  return process.type === 'browser' ? transport : null;

  function transport(msg) {
    if (!electron.BrowserWindow) return;

    electron.BrowserWindow.getAllWindows().forEach(function (wnd) {
      msg.data = msg.data.map(format.stringifyObject);
      wnd.webContents.send(IPC_EVENT, msg);
    });
  }
}
