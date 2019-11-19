'use strict';

var format = require('../format');
var electronApi = require('../electronApi');

var IPC_EVENT = '__ELECTRON_LOG_TRANSPORT_IPC__';

module.exports = ipcTransportFactory;

function ipcTransportFactory(electronLog) {
  transport.level = electronLog.isDev ? 'silly' : false;
  transport.format = '[{h}:{i}:{s}.{ms}] {text}';

  electronApi.onIpc(IPC_EVENT, function (event, msg) {
    electronLog.transports.console(msg);
  });

  electronApi.loadRemoteModule('electron-log');

  return electronApi.isElectron() ? transport : null;

  function transport(msg) {
    msg.data = msg.data.map(format.stringifyObject);
    electronApi.sendIpc(IPC_EVENT, msg);
  }
}
