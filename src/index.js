'use strict';

/* eslint-disable global-require */

const isRenderer = typeof process === 'undefined'
  || (process.type === 'renderer' || process.type === 'worker');

if (isRenderer) {
  module.exports = require('./renderer');
} else {
  module.exports = require('./main');
}
