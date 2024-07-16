'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const log = require('../..');

async function createWindow() {
  log.initialize();

  log.info('log from the main process');

  const t = process.argv.includes('--test').toString();
  const win = new BrowserWindow({
    show: t === 'false',
    webPreferences: {
      contextIsolation: false,
    },
  });

  await win.loadURL(`file://${path.join(__dirname, 'index.html')}?test=${t}`);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());
