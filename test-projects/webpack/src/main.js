'use strict';

var electron = require('electron');
var log      = require('src/electron-log');
var path     = require('path');

var app = electron.app;

var win;

function createWindow() {
  win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true }
  });
  win.loadURL('file://' + path.join(__dirname, '../index.html'));
  win.on('closed', function () { win = null });

  log.warn('log from the main process');
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (!win) {
    createWindow();
  }
});
