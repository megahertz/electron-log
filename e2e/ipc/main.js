'use strict';

var path = require('path');
var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var log = require('../..');
var electronApi = require('../../src/electronApi');

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

  log.transports.ipc.level = 'silly';
  log.transports.file.level = false;

  electronApi.onIpc(log.transports.ipc.eventId, function (_, message) {
    log.transports.file(message);
  });

  win.webContents.once('dom-ready', function () {
    log.info({
      name: 'Log object in main',
    });

    log.info(function functionInMain() {
      return 1;
    });

    log.info(new Error('Error in main'));
  });
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
