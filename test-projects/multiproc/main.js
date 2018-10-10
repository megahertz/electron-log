'use strict';

var path          = require('path');
var electron      = require('electron');
var app           = electron.app;
var BrowserWindow = electron.BrowserWindow;
var log           = require('../..');

var win;

function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL('file://' + path.join(__dirname, 'index.html'));
  win.on('closed', function () { win = null });

  log.transports.rendererConsole.level = 'silly';
  log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{processType} ] {text}';


  setTimeout(function () {
    log.info({
      name: 'Test object'
    });

    log.info(function testFunction() {
      return 1;
    });

    log.info(new Error('Test error'));
  }, 599);
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
