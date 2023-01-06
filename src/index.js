'use strict';

/* eslint-disable global-require */

const isRenderer = typeof process === 'undefined'
  || (process.type === 'renderer' || process.type === 'worker');

if (isRenderer) {
  module.exports = require('./renderer/preload');
} else {
  module.exports = require('./main');
}
