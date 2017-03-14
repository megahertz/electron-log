import path from 'path';
import { app, BrowserWindow } from 'electron';
import log from 'electron-log';

let win;

function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL('file://' + path.join(__dirname, '../index.html'));
  win.on('closed', () => win = null);

  setInterval(() => log.warn('log from main process'), 1000);
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
