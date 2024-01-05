'use strict';

const electron = require('electron');
const path = require('path');
const NodeExternalApi = require('../node/NodeExternalApi');

class ElectronExternalApi extends NodeExternalApi {
  getAppName() {
    try {
      return electron.app?.name || electron.app?.getName();
    } catch {
      return super.getAppName();
    }
  }

  getAppUserDataPath(appName) {
    return this.getPath('userData') || super.getAppUserDataPath(appName);
  }

  getAppVersion() {
    try {
      return electron.app?.getVersion();
    } catch {
      return super.getAppVersion();
    }
  }

  getElectronLogPath() {
    return this.getPath('logs') || super.getElectronLogPath();
  }

  /**
   * @private
   * @param {any} name
   * @returns {string|undefined}
   */
  getPath(name) {
    try {
      return electron.app?.getPath(name);
    } catch {
      return undefined;
    }
  }

  getVersions() {
    return {
      app: `${this.getAppName()} ${this.getAppVersion()}`,
      electron: `Electron ${process.versions.electron}`,
      os: this.getOsVersion(),
    };
  }

  getSystemPathAppData() {
    return this.getPath('appData') || super.getSystemPathAppData();
  }

  isDev() {
    if (electron.app?.isPackaged !== undefined) {
      return !electron.app.isPackaged;
    }

    if (typeof process.execPath === 'string') {
      const execFileName = path.basename(process.execPath).toLowerCase();
      return execFileName.startsWith('electron');
    }

    return super.isDev();
  }

  onAppEvent(eventName, handler) {
    electron.app?.on(eventName, handler);

    return () => {
      electron.app?.off(eventName, handler);
    };
  }

  onAppReady(handler) {
    if (electron.app?.isReady()) {
      handler();
    } else if (electron.app?.once) {
      electron.app?.once('ready', handler);
    } else {
      handler();
    }
  }

  onEveryWebContentsEvent(eventName, handler) {
    electron.webContents?.getAllWebContents().forEach((webContents) => {
      webContents.on(eventName, handler);
    });

    electron.app?.on('web-contents-created', onWebContentsCreated);

    return () => {
      electron.webContents?.getAllWebContents().forEach((webContents) => {
        webContents.off(eventName, handler);
      });

      electron.app?.off('web-contents-created', onWebContentsCreated);
    };

    function onWebContentsCreated(_, webContents) {
      webContents.on(eventName, handler);
    }
  }

  /**
   * Listen to async messages sent from opposite process
   * @param {string} channel
   * @param {function} listener
   */
  onIpc(channel, listener) {
    electron.ipcMain?.on(channel, listener);
  }

  onIpcInvoke(channel, listener) {
    electron.ipcMain?.handle?.(channel, listener);
  }

  /**
   * @param {string} url
   * @param {Function} [logFunction]
   */
  openUrl(url, logFunction = console.error) { // eslint-disable-line no-console
    electron.shell?.openExternal(url).catch(logFunction);
  }

  setPreloadFileForSessions({
    filePath,
    includeFutureSession = true,
    getSessions = () => [electron.session?.defaultSession],
  }) {
    for (const session of getSessions().filter(Boolean)) {
      setPreload(session);
    }

    if (includeFutureSession) {
      this.onAppEvent('session-created', (session) => {
        setPreload(session);
      });
    }

    /**
     * @param {Session} session
     */
    function setPreload(session) {
      session.setPreloads([...session.getPreloads(), filePath]);
    }
  }

  /**
   * Sent a message to opposite process
   * @param {string} channel
   * @param {any} message
   */
  sendIpc(channel, message) {
    electron.BrowserWindow?.getAllWindows().forEach((wnd) => {
      if (wnd.webContents?.isDestroyed() === false) {
        wnd.webContents.send(channel, message);
      }
    });
  }

  showErrorBox(title, message) {
    electron.dialog?.showErrorBox(title, message);
  }
}

module.exports = ElectronExternalApi;
