'use strict';

const os = require('os');
const path = require('path');

/** @type {Electron.Main} */
let electron;
try {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  electron = require('electron');
} catch {
  electron = null;
}

module.exports = {
  getAppUserDataPath() {
    return getPath('userData');
  },

  getName,

  getPath,

  getVersion,

  getVersions() {
    return {
      app: `${getName()} ${getVersion()}`,
      electron: `Electron ${process.versions.electron}`,
      os: getOsVersion(),
    };
  },

  isDev() {
    const app = getApp();

    if (app?.isPackaged !== undefined) {
      return !app.isPackaged;
    }

    if (typeof process.execPath === 'string') {
      const execFileName = path.basename(process.execPath).toLowerCase();
      return execFileName.startsWith('electron');
    }

    return process.env.NODE_ENV === 'development'
      || process.env.ELECTRON_IS_DEV === '1';
  },

  isElectron() {
    return Boolean(process.versions.electron);
  },

  onAppEvent(eventName, handler) {
    electron?.app?.on(eventName, handler);

    return () => {
      electron?.app?.off(eventName, handler);
    };
  },

  onAppReady(handler) {
    if (electron?.app?.isReady()) {
      handler();
    } else if (electron?.app?.once) {
      electron?.app?.once('ready', handler);
    } else {
      handler();
    }
  },

  onEveryWebContentsEvent(eventName, handler) {
    electron?.webContents?.getAllWebContents().forEach((webContents) => {
      webContents.on(eventName, handler);
    });

    electron?.app?.on('web-contents-created', onWebContentsCreated);

    return () => {
      electron?.webContents?.getAllWebContents().forEach((webContents) => {
        webContents.off(eventName, handler);
      });

      electron?.app?.off('web-contents-created', onWebContentsCreated);
    };

    function onWebContentsCreated(_, webContents) {
      webContents.on(eventName, handler);
    }
  },

  /**
   * Listen to async messages sent from opposite process
   * @param {string} channel
   * @param {function} listener
   */
  onIpc(channel, listener) {
    getIpc()?.on(channel, listener);
  },

  onIpcInvoke(channel, listener) {
    getIpc()?.handle?.(channel, listener);
  },

  /**
   * @param {string} url
   * @param {Function} [logFunction]
   */
  openUrl(url, logFunction = console.error) { // eslint-disable-line no-console
    getElectronModule('shell')?.openExternal(url).catch(logFunction);
  },

  setPreloadFileForSessions({
    filePath,
    includeFutureSession = true,
    getSessions = () => [electron?.session?.defaultSession],
  }) {
    for (const session of getSessions().filter(Boolean)) {
      setPreload(session);
    }

    if (includeFutureSession) {
      electron?.app?.on('session-created', (session) => {
        setPreload(session);
      });
    }

    /**
     * @param {Session} session
     */
    function setPreload(session) {
      session.setPreloads([...session.getPreloads(), filePath]);
    }
  },

  /**
   * Sent a message to opposite process
   * @param {string} channel
   * @param {any} message
   */
  sendIpc(channel, message) {
    if (process.type === 'browser') {
      sendIpcToRenderer(channel, message);
    } else if (process.type === 'renderer') {
      sendIpcToMain(channel, message);
    }
  },

  showErrorBox(title, message) {
    const dialog = getElectronModule('dialog');
    if (!dialog) return;

    dialog.showErrorBox(title, message);
  },
};

function getApp() {
  return getElectronModule('app');
}

function getName() {
  const app = getApp();
  if (!app) return null;

  return 'name' in app ? app.name : app.getName();
}

function getElectronModule(name) {
  return electron?.[name] || null;
}

function getIpc() {
  if (process.type === 'browser' && electron?.ipcMain) {
    return electron.ipcMain;
  }

  if (process.type === 'renderer' && electron?.ipcRenderer) {
    return electron.ipcRenderer;
  }

  return null;
}

function getVersion() {
  const app = getApp();
  if (!app) return null;

  return 'version' in app ? app.version : app.getVersion();
}

function getOsVersion() {
  let osName = os.type().replace('_', ' ');
  let osVersion = os.release();

  if (osName === 'Darwin') {
    osName = 'macOS';
    osVersion = getMacOsVersion();
  }

  return `${osName} ${osVersion}`;
}

function getMacOsVersion() {
  const release = Number(os.release().split('.')[0]);
  if (release <= 19) {
    return `10.${release - 4}`;
  }

  return release - 9;
}

function getPath(name) {
  const app = getApp();
  if (!app) return null;

  try {
    return app.getPath(name);
  } catch (e) {
    return null;
  }
}

function sendIpcToMain(channel, message) {
  getIpc()?.send(channel, message);
}

function sendIpcToRenderer(channel, message) {
  electron?.BrowserWindow?.getAllWindows().forEach((wnd) => {
    if (wnd.webContents?.isDestroyed() === false) {
      wnd.webContents.send(channel, message);
    }
  });
}
