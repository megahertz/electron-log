'use strict';

var format = require('../format');
var utils  = require('../utils');

var IPC_EVENT = '__ELECTRON_LOG_MAIN_CONSOLE__';

module.exports = mainConsoleTransportFactory;

function mainConsoleTransportFactory(electronLog) {
  transport.level  = electronLog.isDev ? 'silly' : false;
  transport.format = '[{h}:{i}:{s}.{ms}] {text}';

  switch (process.type) {
    case 'browser': {
      utils.onIpcMain(IPC_EVENT, function (event, msg) {
        electronLog.transports.console(msg);
      });

      return null;
    }

    case 'renderer': {
      try {
        utils.getRemote().require('electron-log');
      } catch (e) {
        // Can't auto require, electron-log should be required explicitly
      }

      return transport;
    }

    default: {
      return null;
    }
  }

  function transport(msg) {
    msg.data = msg.data.map(format.stringifyObject);
    utils.sendIpcToMain(IPC_EVENT, msg);
  }
}
