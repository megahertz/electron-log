'use strict';

/**
 * Split Electron API from the main code
 */

var electron;
try {
  electron = require('electron');
} catch (e) {
  electron = null;
}

module.exports = {
  getName: getName,
  getUserData: getUserData,
  isDev: isDev,
  isElectron: isElectron,
  loadRemoteModule: loadRemoteModule,
  onIpc: onIpc,
  sendIpc: sendIpc,
  showErrorBox: showErrorBox
};

function getApp() {
  return getElectronModule('app');
}

function getName() {
  var app = getApp();
  if (!app) return null;

  return 'name' in app ? app.name : app.getName();
}

function getElectronModule(name) {
  if (!electron) {
    return null;
  }

  if (electron[name]) {
    return electron[name];
  }

  if (electron.remote) {
    return electron.remote[name];
  }

  return null;
}

function getRemote() {
  if (electron && electron.remote) {
    return electron.remote;
  }

  return null;
}

function getUserData() {
  var app = getApp();
  if (!app) return null;

  return app.getPath('userData');
}

function isDev() {
  // based on sindresorhus/electron-is-dev
  var app = getApp();
  if (!app) return false;

  return !app.isPackaged || process.env.ELECTRON_IS_DEV === '1';
}

function isElectron() {
  return process.type === 'browser' || process.type === 'renderer';
}

/**
 * Try to load the module in the opposite process
 * @param {string} moduleName
 */
function loadRemoteModule(moduleName) {
  if (process.type === 'browser') {
    getApp().on('web-contents-created', function (e, contents) {
      contents.executeJavaScript(
        'try {require("' + moduleName + '")} catch(e){}'
      );
    });
  } else if (process.type === 'renderer') {
    try {
      getRemote().require(moduleName);
    } catch (e) {
      // Can't be required. Webpack?
    }
  }
}

/**
 * Listen to async messages sent from opposite process
 * @param {string} channel
 * @param {function} listener
 */
function onIpc(channel, listener) {
  if (process.type === 'browser') {
    onIpcMain(channel, listener);
  } else if (process.type === 'renderer') {
    onIpcRenderer(channel, listener);
  }
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

/**
 * Sent a message to opposite process
 * @param {string} channel
 * @param {any} message
 */
function sendIpc(channel, message) {
  if (process.type === 'browser') {
    sendIpcToRenderer(channel, message);
  } else if (process.type === 'renderer') {
    sendIpcToMain(channel, message);
  }
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

function showErrorBox(title, message) {
  var dialog = getElectronModule('dialog');
  if (!dialog) return;

  dialog.showErrorBox(title, message);
}
