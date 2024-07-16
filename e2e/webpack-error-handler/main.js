'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const log = require('../..');

async function createWindow() {
  log.initialize({ preload: true });
  log.errorHandler.startCatching({ showDialog: false });

  log.info('log from the main process');

  // noinspection ES6MissingAwait
  Promise.reject(new Error('Unhandled main rejection'));
  setTimeout(() => { throw new Error('Unhandled main error') }, 0);

  const t = process.argv.includes('--test') ? 'true' : 'false';
  const win = new BrowserWindow({
    show: t === 'false',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false,
    },
  });

  await win.loadURL(`file://${path.join(__dirname, 'index.html')}?test=${t}`);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());
