'use strict';

const electronApi = require('./core/electronApi');
const transportConsole = require('./transports/console');
const transportFile = require('./transports/file');
const transportRemote = require('./transports/remote');
const Logger = require('./core/Logger');

module.exports = new Logger({
  isDev: electronApi.isDev(),
  logId: 'default',
  transportFactories: {
    console: transportConsole,
    file: transportFile,
    remote: transportRemote,
  },
});
module.exports.default = module.exports;

electronApi.onIpc('__ELECTRON_LOG__', (_, message) => {
  if (message.scope) {
    Logger.getInstance(message).scope(message.scope);
  }

  const date = new Date(message.date);
  processMessage({
    ...message,
    date: date.getTime() ? date : new Date(),
  });
});

electronApi.onIpcInvoke('__ELECTRON_LOG__', (_, { cmd = '' }) => {
  switch (cmd) {
    case 'getOptions': {
      // Currently, used as a ping response only, TBD
      return {};
    }

    default: {
      processMessage({ data: [`Unknown cmd '${cmd}'`], level: 'error' });
      return {};
    }
  }
});

function processMessage(message) {
  Logger.getInstance(message)?.processMessage(message);
}
