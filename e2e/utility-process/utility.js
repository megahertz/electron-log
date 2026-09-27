'use strict';

const log = require('../../node');

log.variables.processType = 'utility';
log.transports = {
  parentPort: (msg) => process.parentPort.postMessage({ __electronLog: msg }),
};

log.info('log from the utility process');
log.warn('object', { a: 1 });
log.error(new Error('utility error'));
log.scope('worker').info('scoped log');

process.parentPort.postMessage('done');
