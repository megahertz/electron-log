'use strict';

var electron = require('electron');
var log = require('electron-log');
var path = require('path');

function createWindow() {
  var win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  var test = process.argv.includes('--test') ? 'true' : 'false';
  win.loadURL('file://' + path.join(__dirname, '../index.html?test=' + test));
  log.warn('log from the main process');
}

electron.app
  .on('ready', createWindow)
  .on('window-all-closed', function () { electron.app.quit() });
