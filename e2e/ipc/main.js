'use strict';

var electron = require('electron');
var path = require('path');
var log = require('../..');
var electronApi = require('../../src/electronApi');

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
  win.loadURL('file://' + path.join(__dirname, 'index.html?test=' + test));

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

electron.app
  .on('ready', createWindow)
  .on('window-all-closed', function () { electron.app.quit() });
