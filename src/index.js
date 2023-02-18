'use strict';

/* eslint-disable global-require */

const isRenderer = typeof process === 'undefined'
  || (process.type === 'renderer' || process.type === 'worker');

if (isRenderer) {
  // Makes sense when contextIsolation/sandbox disabled
  require('./renderer/electron-log-preload');
  module.exports = require('./renderer');
} else {
  module.exports = require('./main');
}
