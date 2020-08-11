'use strict';

var path = require('path');
var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var log = require('../..');

var win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
  });
  win.loadURL('file://' + path.join(__dirname, 'index.html'));
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
