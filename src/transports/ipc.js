'use strict';

var format = require('../format');
var electronApi = require('../electronApi');
var log = require('../log.js');

module.exports = ipcTransportFactory;

function ipcTransportFactory(electronLog) {
  transport.eventId = '__ELECTRON_LOG_IPC_' + electronLog.logId + '__';
  transport.level = electronLog.isDev ? 'silly' : false;
  transport.format = '[{h}:{i}:{s}.{ms}] {text}';

  electronApi.onIpc(transport.eventId, function (_, message) {
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
    electronApi.sendIpc(transport.eventId, message);
  }
}
