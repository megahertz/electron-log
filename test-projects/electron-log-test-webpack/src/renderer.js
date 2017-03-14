const log = require('electron-log');

setInterval(() => log.warn('log from renderer process'), 1000);