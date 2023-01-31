'use strict';

// eslint-disable-next-line no-console
const consoleError = console.error;
let electron = {};

try {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  electron = require('electron');
} catch (e) {
  // require isn't available, not from a preload script
}

initialize(electron);

/**
 * @param {Electron.ContextBridge} contextBridge
 * @param {Electron.IpcRenderer} ipcRenderer
 */
function initialize({ contextBridge, ipcRenderer }) {
  if (!ipcRenderer) {
    return;
  }

  ipcRenderer.on('__ELECTRON_LOG_IPC__', (_, message) => {
    window.postMessage({ cmd: 'message', ...message });
  });

  ipcRenderer
    .invoke('__ELECTRON_LOG__', { cmd: 'getOptions' })
    .catch((e) => consoleError(new Error(
      'electron-log isn\'t initialized in the main process. '
      + `Please call log.initialize() before. ${e.message}`,
    )));

  const __electronLog = {
    sendToMain(message) {
      try {
        ipcRenderer.send('__ELECTRON_LOG__', message);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('electronLog.sendToMain ', e, 'data:', message);

        ipcRenderer.send('__ELECTRON_LOG__', {
          cmd: 'errorHandler',
          error: { message: e?.message, stack: e?.stack },
          errorName: 'sendToMain',
        });
      }
    },

    log(...data) {
      __electronLog.sendToMain({ data, level: 'info' });
    },
  };

  for (const level of ['error', 'warn', 'info', 'verbose', 'debug', 'silly']) {
    __electronLog[level] = (...data) => __electronLog.sendToMain({
      data,
      level,
    });
  }

  if (contextBridge && process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('__electronLog', __electronLog);
    } catch {
      // Sometimes this files can be included twice
    }
  }

  if (typeof window === 'object') {
    window.__electronLog = __electronLog;
  } else if (typeof global === 'object') {
    global.__electronLog = __electronLog;
  }
}
