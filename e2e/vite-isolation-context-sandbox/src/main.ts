import { app, BrowserWindow } from 'electron';
import * as log from 'electron-log';
import path from 'path';

async function createWindow() {
  log.initialize({ preload: true });

  log.info('log from the main process');

  const t = process.argv.includes('--test').toString();
  const win = new BrowserWindow({ show: t === 'false' });
  await win.loadURL(`file://${path.join(__dirname, 'index.html')}?test=${t}`);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());
