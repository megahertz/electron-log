'use strict';

const log = require('electron-log');

log.info('log from renderer');
electronLog.info('log through global object');

if (window.location.href.includes('test=true')) {
  setTimeout(() => window.close(), 50);
}
