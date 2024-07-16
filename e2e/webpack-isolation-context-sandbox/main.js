// noinspection DuplicatedCode

'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const log = require('../..');

async function createWindow() {
  log.initialize({ preload: true });

  log.info('log from the main process');

  const t = process.argv.includes('--test') ? 'true' : 'false';
  const win = new BrowserWindow({ show: t === 'false' });
  await win.loadURL(`file://${path.join(__dirname, 'index.html')}?test=${t}`);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());
