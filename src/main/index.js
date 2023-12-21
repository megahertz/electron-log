'use strict';

const electronApi = require('./electronApi');
const { initialize } = require('./initialize');
const transportConsole = require('./transports/console');
const transportFile = require('./transports/file');
const transportRemote = require('./transports/remote');
const Logger = require('../core/Logger');
const ErrorHandler = require('./ErrorHandler');
const EventLogger = require('./EventLogger');

const defaultLogger = new Logger({
  errorHandler: new ErrorHandler(),
  eventLogger: new EventLogger(),
  initializeFn: initialize,
  isDev: electronApi.isDev(),
  logId: 'default',
  transportFactories: {
    console: transportConsole,
    file: transportFile,
    remote: transportRemote,
  },
  variables: {
    processType: 'main',
  },
});

defaultLogger.processInternalErrorFn = (e) => {
  defaultLogger.transports.console.writeFn({
    message: {
      data: ['Unhandled electron-log error', e],
      level: 'error',
    },
  });
};

module.exports = defaultLogger;
module.exports.Logger = Logger;
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

electronApi.onIpcInvoke('__ELECTRON_LOG__', (_, { cmd = '', logId }) => {
  switch (cmd) {
    case 'getOptions': {
      const logger = Logger.getInstance({ logId });
      return {
        levels: logger.levels,
        logId,
      };
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
