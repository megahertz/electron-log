'use strict';

var log = require('electron-log');
log.warn('log from a renderer process');

if (window.location.href.includes('test=true')) {
  window.close();
}
