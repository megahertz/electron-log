'use strict';

var electron = require('electron');
var log      = require('src/electron-log');

var proc = electron.remote.process;

log.warn('log from a renderer process');

if (proc.argv.indexOf('--test') !== -1) {
  setTimeout(function () { proc.exit() }, 50);
}
