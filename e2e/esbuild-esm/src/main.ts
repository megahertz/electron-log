import { app, BrowserWindow } from 'electron';
import log from 'electron-log/main';
import path from 'node:path';

async function createWindow() {
  log.initialize({ preload: true });

  log.info('log from the main process');

  const win = new BrowserWindow();

  const t = process.argv.includes('--test') ? 'true' : 'false';
  await win.loadURL(`file://${path.join(process.cwd(), 'index.html')}?test=${t}`);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());
