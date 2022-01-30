'use strict';

var electron = require('electron');
var path = require('path');
var log = require('../..');

function createWindow() {
  var win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
  });

  var test = process.argv.includes('--test') ? 'true' : 'false';
  win.loadURL('file://' + path.join(__dirname, 'index.html?test=' + test));

  log.warn('log from the main process');

  electron.ipcMain.on('electron-log', function (e, method, data) {
    log[method].apply(log, data);
  });
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
