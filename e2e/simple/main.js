'use strict';

var electron = require('electron');
var path = require('path');
var log = require('../..');

function createWindow() {
  var win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.loadURL('file://' + path.join(__dirname, 'index.html'));

  log.warn('log from the main process');
}

electron.app
  .on('ready', createWindow)
  .on('browser-window-created', function (e, wnd) {
    wnd.on('close', function () {
      if (process.argv.indexOf('--test') !== -1) {
        electron.app.quit();
      }
    });
  })
  .on('window-all-closed', function () { electron.app.quit() });
