'use strict';

var format = require('../format');
var utils  = require('../utils');

var IPC_EVENT = '__ELECTRON_LOG_RENDERER_CONSOLE__';

module.exports = renderConsoleTransportFactory;

function renderConsoleTransportFactory(electronLog) {
  transport.level  = electronLog.isDev ? 'silly' : false;
  transport.format = '[{h}:{i}:{s}.{ms}] {text}';

  switch (process.type) {
    case 'browser': {
      // require electron-log in renderer
      utils.getElectronApp().on('web-contents-created', function (e, contents) {
        contents.executeJavaScript('try {require("electron-log")} catch(e){}');
      });

      return transport;
    }

    case 'renderer': {
      utils.onIpcRenderer(IPC_EVENT, function (event, msg) {
        electronLog.transports.console(msg);
      });

      return null;
    }

    default: {
      return null;
    }
  }

  function transport(msg) {
    msg.data = msg.data.map(format.stringifyObject);
    utils.sendIpcToRenderer(IPC_EVENT, msg);
  }
}
