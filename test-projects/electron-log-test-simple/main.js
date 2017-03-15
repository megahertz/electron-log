'use strict';

const path          = require('path');
const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const log           = require('../..');

let win;

function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL('file://' + path.join(__dirname, 'index.html'));
  win.on('closed', () => win = null);

  log.warn('log from the main process');
}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!win) {
    createWindow();
  }
});
