'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const log = require('../..');

async function createWindow() {
  log.initialize({ preload: true });
  log.addLevel('notice', 2);

  log.notice('log from the main process');

  const win = new BrowserWindow({
    webPreferences: {
      contextIsolation: false,
    },
  });

  const t = process.argv.includes('--test') ? 'true' : 'false';
  await win.loadURL(`file://${path.join(__dirname, 'index.html')}?test=${t}`);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());
