'use strict';

var format = require('../format');
var electronApi = require('../electronApi');
var log = require('../log.js');

var IPC_EVENT = '__ELECTRON_LOG_TRANSPORT_IPC__';

module.exports = ipcTransportFactory;

function ipcTransportFactory(electronLog) {
  transport.level = electronLog.isDev ? 'silly' : false;
  transport.format = '[{h}:{i}:{s}.{ms}] {text}';

  electronApi.onIpc(IPC_EVENT, function (_, message) {
    log.runTransport(
      electronLog.transports.console,
      message,
      electronLog
    );
  });

  electronApi.loadRemoteModule('electron-log');

  return electronApi.isElectron() ? transport : null;

  function transport(message) {
    message.data = message.data.map(format.stringifyObject);
    electronApi.sendIpc(IPC_EVENT, message);
  }
}
