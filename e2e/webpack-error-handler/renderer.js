'use strict';

const log = require('electron-log');

log.errorHandler.startCatching();

log.info('log from a renderer process');

setTimeout(() => {
  Promise.reject(new Error('Unhandled renderer rejection'));
  throw new Error('Unhandled renderer error');
}, 10);

if (window.location.href.includes('test=true')) {
  setTimeout(() => window.close(), 100);
}
