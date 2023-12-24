'use strict';

const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const log = require('../..');

async function createWindow() {
  log.initialize({ preload: true });

  const PARTITION = 'persist:test';
  session.fromPartition(PARTITION);

  log.info('log from the main process');

  const win = new BrowserWindow({
    webPreferences: {
      partition: PARTITION,
    },
  });

  const t = process.argv.includes('--test') ? 'true' : 'false';
  await win.loadURL(`file://${path.join(__dirname, 'index.html')}?test=${t}`);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());
