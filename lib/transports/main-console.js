'use strict';

var format = require('../format');
var utils  = require('../utils');

var IPC_EVENT = '__ELECTRON_LOG_MAIN_CONSOLE__';

module.exports = mainConsoleTransportFactory;

function mainConsoleTransportFactory(electronLog) {
  transport.level  = electronLog.isDev ? 'silly' : false;
  transport.format = '[{h}:{i}:{s}.{ms}] {text}';

  utils.onIpcMain(IPC_EVENT, function (event, msg) {
    electronLog.transports.console(msg);
  });

  return process.type === 'renderer' ? transport : null;

  function transport(msg) {
    msg.data = msg.data.map(format.stringifyObject);
    utils.sendIpcToMain(IPC_EVENT, msg);
  }
}
