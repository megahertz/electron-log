'use strict';

var electron;
try {
  electron = require('electron');
} catch (e) {
  electron = null;
}

module.exports = {
  getElectronApp: getElectronApp,
  getElectronAppName: getElectronAppName,
  getRemote: getRemote,
  getUserData: getUserData,
  isDev: isDev,
  onIpcMain: onIpcMain,
  onIpcRenderer: onIpcRenderer,
  sendIpcToMain: sendIpcToMain,
  sendIpcToRenderer: sendIpcToRenderer
};

function getElectronApp() {
  if (!electron) {
    return null;
  }

  if (electron.app) {
    return electron.app;
  }

  if (electron.remote) {
    return electron.remote.app;
  }

  return null;
}

function getElectronAppName() {
  var app = getElectronApp();
  if (!app) return null;

  return app.getName();
}

function getRemote() {
  if (electron && electron.remote) {
    return electron.remote;
  }

  return null;
}

function getUserData() {
  var app = getElectronApp();
  if (!app) return null;

  return app.getPath('userData');
}

function isDev() {
  // based on sindresorhus/electron-is-dev
  var app = getElectronApp();
  if (!app) return false;

  return !app.isPackaged || process.env.ELECTRON_IS_DEV === '1';
}

function onIpcMain(channel, listener) {
  if (!electron || !electron.ipcMain) {
    return;
  }

  electron.ipcMain.on(channel, listener);
}

function onIpcRenderer(channel, listener) {
  if (!electron || !electron.ipcRenderer) {
    return;
  }

  electron.ipcRenderer.on(channel, listener);
}

function sendIpcToMain(channel, message) {
  if (!electron || !electron.ipcRenderer) {
    return;
  }

  electron.ipcRenderer.send(channel, message);
}

function sendIpcToRenderer(channel, message) {
  if (!electron || !electron.BrowserWindow) {
    return;
  }

  electron.BrowserWindow.getAllWindows().forEach(function (wnd) {
    wnd.webContents.send(channel, message);
  });
}
