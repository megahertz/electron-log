'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const log = require('../..');

async function createWindow() {
  log.initialize({ preload: true });
  log.info('log from the main process');

  const win = new BrowserWindow();

  const initUrl = new URL(`file://${path.join(__dirname, 'index.html')}`);
  initUrl.searchParams.set('test', process.argv.includes('--test').toString());
  initUrl.searchParams.set('dirname', __dirname);

  await win.loadURL(initUrl.href);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());
