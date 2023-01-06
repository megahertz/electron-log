'use strict';

const electronApi = require('../electronApi');
const { maxDepth, toJSON } = require('../transforms/object');
const { transform } = require('../transforms/transform');

module.exports = ipcTransportFactory;

function ipcTransportFactory(logger) {
  Object.assign(transport, {
    depth: 3,
    eventId: '__ELECTRON_LOG_IPC__',
    level: logger.isDev ? 'silly' : false,
    transforms: [toJSON, maxDepth],
  });

  return electronApi.isElectron() ? transport : null;

  function transport(message) {
    electronApi.sendIpc(transport.eventId, {
      ...message,
      data: transform({ logger, message, transport }),
    });
  }
}
