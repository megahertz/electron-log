/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {



const { app, BrowserWindow } = __webpack_require__(/*! electron */ "electron");
const path = __webpack_require__(/*! path */ "path");
const log = __webpack_require__(/*! ../.. */ "../../src/index.js");

async function createWindow() {
  log.initialize({ preload: true });

  log.info('log from the main process');

  const win = new BrowserWindow({
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false,
    },
  });

  const t = process.argv.includes('--test') ? 'true' : 'false';
  await win.loadURL(`file://${path.join(__dirname, 'index.html')}?test=${t}`);
}

app
  .on('ready', createWindow)
  .on('window-all-closed', () => app.quit());


/***/ }),

/***/ "../../src/core/ErrorHandler.js":
/*!**************************************!*\
  !*** ../../src/core/ErrorHandler.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const electronApi = __webpack_require__(/*! ./electronApi */ "../../src/core/electronApi.js");

class ErrorHandler {
  isActive = false;
  logFn = null;
  onError = null;
  showDialog = true;

  constructor({ logFn = null, onError = null, showDialog = true } = {}) {
    this.createIssue = this.createIssue.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleRejection = this.handleRejection.bind(this);
    this.setOptions({ logFn, onError, showDialog });
    this.startCatching = this.startCatching.bind(this);
    this.stopCatching = this.stopCatching.bind(this);
  }

  handle(error, {
    logFn = this.logFn,
    onError = this.onError,
    processType = 'browser',
    showDialog = this.showDialog,
    errorName = '',
  } = {}) {
    try {
      if (typeof onError === 'function') {
        const versions = electronApi.getVersions();
        const createIssue = this.createIssue;
        if (onError({ error, versions, createIssue }) === false) {
          return;
        }
      }

      errorName ? logFn(errorName, error) : logFn(error);

      if (showDialog && errorName.indexOf('Rejection') === -1) {
        electronApi.showErrorBox(
          `A JavaScript error occurred in the ${processType} process`,
          error.stack,
        );
      }
    } catch {
      console.error(error); // eslint-disable-line no-console
    }
  }

  setOptions({ logFn, onError, showDialog }) {
    if (typeof logFn === 'function') {
      this.logFn = logFn;
    }

    if (typeof onError === 'function') {
      this.onError = onError;
    }

    if (typeof showDialog === 'boolean') {
      this.showDialog = showDialog;
    }
  }

  startCatching({ onError, showDialog, includeRenderer = true } = {}) {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.setOptions({ onError, showDialog });
    process.on('uncaughtException', this.handleError);
    process.on('unhandledRejection', this.handleRejection);

    if (includeRenderer) {
      initializeRendererErrorHandler();
    }
  }

  stopCatching() {
    this.isActive = false;
    process.removeListener('uncaughtException', this.handleError);
    process.removeListener('unhandledRejection', this.handleRejection);
  }

  createIssue(pageUrl, queryParams) {
    electronApi.openUrl(
      `${pageUrl}?${new URLSearchParams(queryParams).toString()}`,
    );
  }

  handleError(error) {
    this.handle(error, { errorName: 'Unhandled' });
  }

  handleRejection(reason) {
    const error = reason instanceof Error
      ? reason
      : new Error(JSON.stringify(reason));
    this.handle(error, { errorName: 'Unhandled rejection' });
  }
}

function initializeRendererErrorHandler() {
  electronApi.executeJsInEveryWebContents(`
    if (typeof electronLog === 'object') {
      window.addEventListener('error', (event) => {
        event.preventDefault();
        electronLog.errorHandler.handleError(event.error);
      });
      window.addEventListener('unhandledrejection', (event) => {
        event.preventDefault();
        electronLog.errorHandler.handleRejection(event.reason);
      });
    }
  `);
}

module.exports = ErrorHandler;


/***/ }),

/***/ "../../src/core/Logger.js":
/*!********************************!*\
  !*** ../../src/core/Logger.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const ErrorHandler = __webpack_require__(/*! ./ErrorHandler */ "../../src/core/ErrorHandler.js");
const { initialize } = __webpack_require__(/*! ./initialize */ "../../src/core/initialize.js");
const scopeFactory = __webpack_require__(/*! ./scope */ "../../src/core/scope.js");

/**
 * @property {Function} error
 * @property {Function} warn
 * @property {Function} info
 * @property {Function} verbose
 * @property {Function} debug
 * @property {Function} silly
 */
class Logger {
  static instances = {};

  functions = {};
  hooks = [];
  isDev = false;
  levels = null;
  logId = null;
  scope = scopeFactory(this);
  transports = {};
  variables = { processType: process.type };

  constructor({
    isDev = false,
    levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
    logId,
    transportFactories = {},
  } = {}) {
    this.addLevel = this.addLevel.bind(this);
    this.create = this.create.bind(this);
    this.logData = this.logData.bind(this);
    this.processMessage = this.processMessage.bind(this);

    this.isDev = isDev;
    this.levels = levels;
    this.logId = logId;
    this.transportFactories = transportFactories;

    this.addLevel('log', false);
    for (const name of this.levels) {
      this.addLevel(name, false);
    }

    this.errorHandler = new ErrorHandler({ logFn: this.error });

    for (const [name, factory] of Object.entries(transportFactories)) {
      this.transports[name] = factory(this);
    }

    Logger.instances[logId] = this;
  }

  static getInstance({ logId }) {
    return this.instances[logId] || this.instances.default;
  }

  addLevel(level, index = this.levels.length) {
    if (index !== false) {
      this.levels.splice(index, 0, level);
    }

    this[level] = (...args) => this.logData(args, { level });
    this.functions[level] = this[level];
  }

  catchErrors(options) {
    this.processMessage(
      {
        data: ['log.catchErrors is deprecated. Use log.errorHandler instead'],
        level: 'warn',
      },
      { transports: ['console'] },
    );
    return this.errorHandler.startCatching(options);
  }

  create(logId) {
    return new Logger({
      isDev: this.isDev,
      logId,
      transportFactories: this.transportFactories,
    });
  }

  compareLevels(passLevel, checkLevel, levels = this.levels) {
    const pass = levels.indexOf(passLevel);
    const check = levels.indexOf(checkLevel);
    if (check === -1 || pass === -1) {
      return true;
    }

    return check <= pass;
  }

  initialize({ preload = true, spyRendererConsole = false } = {}) {
    initialize({ logger: this, preload, spyRendererConsole });
  }

  logData(data, options = {}) {
    this.processMessage({ data, ...options });
  }

  processMessage(message, { transports = this.transports } = {}) {
    if (message.cmd === 'catchError') {
      this.errorHandler.handle(message.error, {
        errorName: message.errorName,
        processType: 'renderer',
        showDialog: Boolean(message.showDialog),
      });
      return;
    }

    const normalizedMessage = {
      date: new Date(),
      ...message,
      level: this.levels.includes(message.level) ? message.level : 'info',
      variables: {
        ...this.variables,
        ...message.variables,
      },
    };

    for (const [transName, transFn] of this.transportEntries(transports)) {
      if (typeof transFn !== 'function' || transFn.level === false) {
        continue;
      }

      if (!this.compareLevels(transFn.level, message.level)) {
        continue;
      }

      // eslint-disable-next-line arrow-body-style
      const transformedMessage = this.hooks.reduce((msg, hook) => {
        return msg ? hook(msg, transFn, transName) : msg;
      }, normalizedMessage);

      if (transformedMessage) {
        transFn(transformedMessage);
      }
    }
  }

  transportEntries(transports = this.transports) {
    const transportArray = Array.isArray(transports)
      ? transports
      : Object.entries(transports);

    return transportArray
      .map((item) => {
        switch (typeof item) {
          case 'string':
            return this.transports[item] ? [item, this.transports[item]] : null;
          case 'function':
            return [item.name, item];
          default:
            return Array.isArray(item) ? item : null;
        }
      })
      .filter(Boolean);
  }
}

module.exports = Logger;


/***/ }),

/***/ "../../src/core/electronApi.js":
/*!*************************************!*\
  !*** ../../src/core/electronApi.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const os = __webpack_require__(/*! os */ "os");
const path = __webpack_require__(/*! path */ "path");

let electron;
try {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  electron = __webpack_require__(/*! electron */ "electron");
} catch {
  electron = null;
}

module.exports = {
  executeJsInEveryWebContents(jsCode) {
    electron?.WebContents?.getAllWebContents().forEach((webContents) => {
      // noinspection JSIgnoredPromiseFromCall
      webContents.executeJavaScript(jsCode);
    });

    electron?.app?.on('web-contents-created', (_, webContents) => {
      // noinspection JSIgnoredPromiseFromCall
      webContents.executeJavaScript(jsCode);
    });
  },

  getName,

  getPath(name) {
    const app = getApp();
    if (!app) return null;

    try {
      return app.getPath(name);
    } catch (e) {
      return null;
    }
  },

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

    return  true
      || 0;
  },

  isElectron() {
    return Boolean(process.versions.electron);
  },

  onEveryWebContentsEvent(message, handler) {
    electron?.WebContents?.getAllWebContents().forEach((webContents) => {
      webContents.on(message, handler);
    });

    electron?.app?.on('web-contents-created', (_, webContents) => {
      webContents.on(message, handler);
    });
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
   * @param {Function} [logFunction?]
   */
  openUrl(url, logFunction = console.error) { // eslint-disable-line no-console
    getElectronModule('shell')?.openExternal(url).catch(logFunction);
  },

  setPreloadFileForSessions({
    filePath,
    includeFutureSession = true,
    sessions = [electron?.session?.defaultSession],
  }) {
    for (const session of sessions.filter(Boolean)) {
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


/***/ }),

/***/ "../../src/core/initialize.js":
/*!************************************!*\
  !*** ../../src/core/initialize.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const {
  onEveryWebContentsEvent,
  setPreloadFileForSessions,
} = __webpack_require__(/*! ./electronApi */ "../../src/core/electronApi.js");

module.exports = {
  initialize({ logger, preload = true, spyRendererConsole = false }) {
    if (preload && spyRendererConsole) {
      throw new Error('Either preload or spyRendererConsole should be set');
    }

    if (preload) {
      initializePreload(preload);
    }

    if (spyRendererConsole) {
      initializeSpyRendererConsole(logger);
    }
  },
};

function initializePreload(preloadOption) {
  const preloadPath = typeof preloadOption === 'string'
    ? preloadOption
    : path.resolve(__dirname, '../renderer.js');

  if (!fs.existsSync(preloadPath)) {
    throw new Error(`Preload file ${preloadPath} doesn't exist`);
  }

  setPreloadFileForSessions({ filePath: preloadPath });
}

function initializeSpyRendererConsole(logger) {
  const levels = ['verbose', 'info', 'warning', 'error'];
  onEveryWebContentsEvent(
    'console-message',
    (event, level, message) => {
      logger.processMessage({ data: [message], level: levels[level] });
    },
  );
}


/***/ }),

/***/ "../../src/core/scope.js":
/*!*******************************!*\
  !*** ../../src/core/scope.js ***!
  \*******************************/
/***/ ((module) => {



module.exports = scopeFactory;

function scopeFactory(logger) {
  return Object.defineProperties(scope, {
    defaultLabel: { value: '', writable: true },
    labelPadding: { value: true, writable: true },
    maxLabelLength: { value: 0, writable: true },
    labelLength: {
      get() {
        switch (typeof scope.labelPadding) {
          case 'boolean': return scope.labelPadding ? scope.maxLabelLength : 0;
          case 'number': return scope.labelPadding;
          default: return 0;
        }
      },
    },
  });

  function scope(label) {
    scope.maxLabelLength = Math.max(scope.maxLabelLength, label.length);

    const newScope = {};
    for (const level of [...logger.levels, 'log']) {
      newScope[level] = (...d) => logger.logData(d, { level, scope: label });
    }
    return newScope;
  }
}


/***/ }),

/***/ "../../src/index.js":
/*!**************************!*\
  !*** ../../src/index.js ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* eslint-disable global-require */

const isRenderer = typeof process === 'undefined'
  || (process.type === 'renderer' || process.type === 'worker');

if (isRenderer) {
  module.exports = __webpack_require__(/*! ./renderer */ "../../src/renderer.js");
} else {
  module.exports = __webpack_require__(/*! ./main */ "../../src/main.js");
}


/***/ }),

/***/ "../../src/main.js":
/*!*************************!*\
  !*** ../../src/main.js ***!
  \*************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const electronApi = __webpack_require__(/*! ./core/electronApi */ "../../src/core/electronApi.js");
const transportConsole = __webpack_require__(/*! ./transports/console */ "../../src/transports/console.js");
const transportFile = __webpack_require__(/*! ./transports/file */ "../../src/transports/file/index.js");
const transportRemote = __webpack_require__(/*! ./transports/remote */ "../../src/transports/remote.js");
const Logger = __webpack_require__(/*! ./core/Logger */ "../../src/core/Logger.js");

module.exports = new Logger({
  isDev: electronApi.isDev(),
  logId: 'default',
  transportFactories: {
    console: transportConsole,
    file: transportFile,
    remote: transportRemote,
  },
});
module.exports["default"] = module.exports;

electronApi.onIpc('__ELECTRON_LOG__', (_, message) => {
  if (message.scope) {
    Logger.getInstance(message).scope(message.scope);
  }

  const date = new Date(message.date);
  processMessage({
    ...message,
    date: date.getTime() ? date : new Date(),
  });
});

electronApi.onIpcInvoke('__ELECTRON_LOG__', (_, { cmd = '' }) => {
  switch (cmd) {
    case 'getOptions': {
      // Currently, used as a ping response only, TBD
      return {};
    }

    default: {
      processMessage({ data: [`Unknown cmd '${cmd}'`], level: 'error' });
      return {};
    }
  }
});

function processMessage(message) {
  Logger.getInstance(message)?.processMessage(message);
}


/***/ }),

/***/ "../../src/renderer.js":
/*!*****************************!*\
  !*** ../../src/renderer.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* eslint-disable no-console */
/* eslint-env browser */

const consoleMethods = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  verbose: console.info,
  debug: console.debug,
  silly: console.debug,
  log: console.log,
};
let contextBridge = null;
let ipcRenderer = null;
const instances = {};

try {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  ({ contextBridge, ipcRenderer } = __webpack_require__(/*! electron */ "electron"));
} catch (e) {
  // require isn't available, not from a preload script
}

const RESTRICTED_TYPES = new Set([Promise, WeakMap, WeakSet]);

class RendererErrorHandler {
  logFn = null;
  onError = null;
  showDialog = false;

  constructor({ logFn }) {
    this.handleError = this.handleError.bind(this);
    this.handleRejection = this.handleRejection.bind(this);
    this.logFn = logFn;
  }

  handle(error, {
    logFn = this.logFn,
    errorName = '',
    onError = this.onError,
    showDialog = this.showDialog,
  } = {}) {
    try {
      if (onError?.({ error }) !== false) {
        logFn({ error, errorName, showDialog });
      }
    } catch {
      consoleMethods.error(error);
    }
  }

  handleError(error) {
    this.handle(error, { errorName: 'Unhandled' });
  }

  handleRejection(reason) {
    const error = reason instanceof Error
      ? reason
      : new Error(JSON.stringify(reason));
    this.handle(error, { errorName: 'Unhandled rejection' });
  }
}

// eslint-disable-next-line no-undef
instances.default = (typeof electronLog === 'object' && electronLog)
  || create();

try {
  module.exports = instances.default;
  module.exports.defaults = module.exports;
} catch {
  // No module available, sandboxed
}

exposeElectronLog(instances.default);

ipcRenderer?.on('__ELECTRON_LOG_IPC__', (_, message) => {
  (instances[message.logId] || instances.default).transports.console(message);
});

function create({
  levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
  logId = 'default',
  scope = undefined,
} = {}) {
  const logFunctions = Object.fromEntries(
    levels.map((level) => [level, (...args) => log(level, args)]),
  );

  logFunctions.log = (...args) => log('info', args);

  const logger = {
    ...logFunctions,
    scopeName: scope,

    errorHandler: new RendererErrorHandler({
      logFn({ error, errorName, showDialog }) {
        logger.transports.console({
          data: [errorName, error].filter(Boolean),
          level: 'error',
        });
        logger.transports.ipc({
          cmd: 'catchError',
          error: error.stack || error,
          errorName,
          logId,
          showDialog,
        });
      },
    }),

    functions: logFunctions,

    transports: {},

    scope(name) {
      return create({ levels, logId, scope: name });
    },

    variables: {
      processType: 'renderer',
    },
  };

  logger.transports = {
    console: consoleTransportFactory(logger),
    ipc: ipcTransportFactory(logger),
  };

  instances[logId] = logger;

  function log(level, data) {
    const message = {
      data,
      date: new Date(),
      level,
      logId,
      scope,
      variables: logger.variables,
    };
    pingMainProcessOnFirstCall(logId);

    Object.values(logger.transports)
      .forEach((t) => t({ ...message, data: [...data] }));
  }

  return logger;
}

function exposeElectronLog(logger) {
  if (typeof process === 'undefined') {
    return;
  }

  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('electronLog', logger);
  } else if (typeof window === 'object') {
    window.electronLog = logger;
  } else if (typeof global === 'object') {
    global.electronLog = logger;
  }
}

function pingMainProcessOnFirstCall(logId) {
  if (pingMainProcessOnFirstCall.wasCalled) {
    return;
  }

  pingMainProcessOnFirstCall.wasCalled = true;

  ipcRenderer.invoke('__ELECTRON_LOG__', { cmd: 'getOptions', logId })
    // eslint-disable-next-line no-console
    .catch((e) => console.error(new Error(
      'electron-log isn\'t initialized in the renderer process. '
      + `Please call log.initialize() before. ${e.message}`,
    )));
}

function consoleTransportFactory(logger) {
  return Object.assign(transport, {
    format: '{h}:{i}:{s}.{ms}{scope} › {text}',

    formatDataFn({
      data = [],
      date = new Date(),
      format = transport.format,
      logId = logger.logId,
      scope = logger.scopeName,
      ...message
    }) {
      if (typeof format === 'function') {
        return format({ ...message, data, date, logId, scope });
      }

      if (typeof format !== 'string') {
        return data;
      }

      data.unshift(format);

      // Concatenate first two data items to support printf-like templates
      if (typeof data[1] === 'string' && data[1].match(/%[1cdfiOos]/)) {
        data = [`${data[0]} ${data[1]}`, ...data.slice(2)];
      }

      data[0] = data[0]
        .replace(/\{(\w+)}/g, (substring, name) => {
          switch (name) {
            case 'level': return message.level;
            case 'logId': return logId;
            case 'scope': return scope ? ` (${scope})` : '';
            case 'text': return '';

            case 'y': return date.getFullYear().toString(10);
            case 'm': return (date.getMonth() + 1).toString(10)
              .padStart(2, '0');
            case 'd': return date.getDate().toString(10).padStart(2, '0');
            case 'h': return date.getHours().toString(10).padStart(2, '0');
            case 'i': return date.getMinutes().toString(10).padStart(2, '0');
            case 's': return date.getSeconds().toString(10).padStart(2, '0');
            case 'ms': return date.getMilliseconds().toString(10)
              .padStart(3, '0');
            case 'iso': return date.toISOString();

            default: {
              return message.variables?.[name] || substring;
            }
          }
        })
        .trim();

      return data;
    },

    writeFn({ level, data }) {
      // make an empty call stack
      setTimeout(() => consoleMethods[level || 'info'](...data));
    },

  });

  function transport(message) {
    transport.writeFn({ ...message, data: transport.formatDataFn(message) });
  }
}

function ipcTransportFactory() {
  return Object.assign(transport, {
    depth: 5,

    serializeFn(data, { depth = 5, seen = new WeakSet() } = {}) {
      if (depth < 1) {
        return `[${typeof data}]`;
      }

      if (seen.has(data)) {
        return data;
      }

      if (['function', 'symbol'].includes(typeof data)) {
        return data.toString();
      }

      // Primitive types (including null and undefined)
      if (Object(data) !== data) {
        return data;
      }

      // Object types

      if (RESTRICTED_TYPES.has(data.constructor)) {
        return `[${data.constructor.name}]`;
      }

      if (Array.isArray(data)) {
        return data.map((item) => transport.serializeFn(
          item,
          { level: depth - 1, seen },
        ));
      }

      if (data instanceof Error) {
        return data.stack;
      }

      if (data instanceof Map) {
        return new Map(
          Array
            .from(data)
            .map(([key, value]) => [
              transport.serializeFn(key, { level: depth - 1, seen }),
              transport.serializeFn(value, { level: depth - 1, seen }),
            ]),
        );
      }

      if (data instanceof Set) {
        return new Set(
          Array.from(data).map(
            (val) => transport.serializeFn(val, { level: depth - 1, seen }),
          ),
        );
      }

      seen.add(data);

      return Object.fromEntries(
        Object.entries(data).map(
          ([key, value]) => [
            key,
            transport.serializeFn(value, { level: depth - 1, seen }),
          ],
        ),
      );
    },
  });

  function transport(message) {
    ipcRenderer.send('__ELECTRON_LOG__', transport.serializeFn(message, {
      depth: transport.depth,
    }));
  }
}


/***/ }),

/***/ "../../src/transforms/format.js":
/*!**************************************!*\
  !*** ../../src/transforms/format.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const { transform } = __webpack_require__(/*! ./transform */ "../../src/transforms/transform.js");

module.exports = {
  concatFirstStringElements,
  formatScope,
  formatText,
  formatVariables,
  timeZoneFromOffset,

  format({ message, logger, transport, data = message?.data }) {
    switch (typeof transport.format) {
      case 'string': {
        return transform({
          message,
          logger,
          transforms: [formatVariables, formatScope, formatText],
          transport,
          initialData: [transport.format, ...data],
        });
      }

      case 'function': {
        return transport.format({
          data,
          level: message?.level || 'info',
          logger,
          message,
          transport,
        });
      }

      default: {
        return data;
      }
    }
  },
};

/**
 * The first argument of console.log may contain a template. In the library
 * the first element is a string related to transports.console.format. So
 * this function concatenates first two elements to make templates like %d
 * work
 * @param {*[]} data
 * @return {*[]}
 */
function concatFirstStringElements({ data }) {
  if (typeof data[0] !== 'string' || typeof data[1] !== 'string') {
    return data;
  }

  if (data[0].match(/%[1cdfiOos]/)) {
    return data;
  }

  return [`${data[0]} ${data[1]}`, ...data.slice(2)];
}

function timeZoneFromOffset(minutesOffset) {
  const minutesPositive = Math.abs(minutesOffset);
  const sign = minutesOffset >= 0 ? '-' : '+';
  const hours = Math.floor(minutesPositive / 60).toString().padStart(2, '0');
  const minutes = (minutesPositive % 60).toString().padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

function formatScope({ data, logger, message }) {
  const { defaultLabel, labelLength } = logger?.scope || {};
  const template = data[0];
  let label = message.scope;

  if (!label) {
    label = defaultLabel;
  }

  let scopeText;
  if (label === '') {
    scopeText = labelLength > 0 ? ''.padEnd(labelLength + 3) : '';
  } else if (typeof label === 'string') {
    scopeText = ` (${label})`.padEnd(labelLength + 3);
  } else {
    scopeText = '';
  }

  data[0] = template.replace('{scope}', scopeText);
  return data;
}

function formatVariables({ data, message }) {
  let template = data[0];
  if (typeof template !== 'string') {
    return data;
  }

  // Add additional space to the end of {level}] template to align messages
  template = template.replace('{level}]', `${message.level}]`.padEnd(6, ' '));

  const date = message.date || new Date();
  data[0] = template
    .replace(/\{(\w+)}/g, (substring, name) => {
      switch (name) {
        case 'level': return message.level || 'info';
        case 'logId': return message.logId;

        case 'y': return date.getFullYear().toString(10);
        case 'm': return (date.getMonth() + 1).toString(10).padStart(2, '0');
        case 'd': return date.getDate().toString(10).padStart(2, '0');
        case 'h': return date.getHours().toString(10).padStart(2, '0');
        case 'i': return date.getMinutes().toString(10).padStart(2, '0');
        case 's': return date.getSeconds().toString(10).padStart(2, '0');
        case 'ms': return date.getMilliseconds().toString(10).padStart(3, '0');
        case 'z': return timeZoneFromOffset(date.getTimezoneOffset());
        case 'iso': return date.toISOString();

        default: {
          return message.variables?.[name] || substring;
        }
      }
    })
    .trim();

  return data;
}

function formatText({ data }) {
  const template = data[0];
  if (typeof template !== 'string') {
    return data;
  }

  const textTplPosition = template.lastIndexOf('{text}');
  if (textTplPosition === template.length - 6) {
    data[0] = template.replace(/\s?{text}/, '');
    if (data[0] === '') {
      data.shift();
    }

    return data;
  }

  const templatePieces = template.split('{text}');
  let result = [];

  if (templatePieces[0] !== '') {
    result.push(templatePieces[0]);
  }

  result = result.concat(data.slice(1));

  if (templatePieces[1] !== '') {
    result.push(templatePieces[1]);
  }

  return result;
}


/***/ }),

/***/ "../../src/transforms/object.js":
/*!**************************************!*\
  !*** ../../src/transforms/object.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const util = __webpack_require__(/*! util */ "util");

module.exports = {
  serialize,

  maxDepth({ data, transport, depth = transport?.depth ?? 6 }) {
    if (!data) {
      return data;
    }

    if (depth < 1) {
      if (Array.isArray(data)) return '[array]';
      if (typeof data === 'object' && data) return '[object]';

      return data;
    }

    if (Array.isArray(data)) {
      return data.map((child) => module.exports.maxDepth({
        data: child,
        depth: depth - 1,
      }));
    }

    if (typeof data !== 'object') {
      return data;
    }

    if (data && typeof data.toISOString === 'function') {
      return data;
    }

    // noinspection PointlessBooleanExpressionJS
    if (data === null) {
      return null;
    }

    if (data instanceof Error) {
      return data;
    }

    const newJson = {};
    for (const i in data) {
      if (!Object.prototype.hasOwnProperty.call(data, i)) continue;
      newJson[i] = module.exports.maxDepth({
        data: data[i],
        depth: depth - 1,
      });
    }

    return newJson;
  },

  toJSON({ data }) {
    return JSON.parse(JSON.stringify(data, createSerializer()));
  },

  toString({ data, transport }) {
    const inspectOptions = transport?.inspectOptions || {};

    const simplifiedData = data.map((item) => {
      if (item === undefined) {
        return undefined;
      }

      try {
        const str = JSON.stringify(item, createSerializer(), '  ');
        return str === undefined ? undefined : JSON.parse(str);
      } catch (e) {
        // There are some rare cases when an item can't be simplified.
        // In that case, it's fine to pass it to util.format directly.
        return item;
      }
    });

    return util.formatWithOptions(inspectOptions, ...simplifiedData);
  },
};

/**
 * @param {object} options?
 * @param {boolean} options.serializeMapAndSet?
 * @return {function}
 */
function createSerializer(options = {}) {
  const seen = new WeakSet();

  return function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined;
      }

      seen.add(value);
    }

    return serialize(key, value, options);
  };
}

/**
 * @param {string} key
 * @param {any} value
 * @param {object} options?
 * @return {any}
 */
function serialize(key, value, options = {}) {
  const serializeMapAndSet = options?.serializeMapAndSet !== false;

  if (value instanceof Error) {
    return value.stack;
  }

  if (!value) {
    return value;
  }

  if (typeof value === 'function') {
    return `[function] ${value.toString()}`;
  }

  if (serializeMapAndSet && value instanceof Map && Object.fromEntries) {
    return Object.fromEntries(value);
  }

  if (serializeMapAndSet && value instanceof Set && Array.from) {
    return Array.from(value);
  }

  return value;
}


/***/ }),

/***/ "../../src/transforms/style.js":
/*!*************************************!*\
  !*** ../../src/transforms/style.js ***!
  \*************************************/
/***/ ((module) => {



module.exports = {
  transformStyles,

  applyAnsiStyles({ data }) {
    return transformStyles(data, styleToAnsi, resetAnsiStyle);
  },

  removeStyles({ data }) {
    return transformStyles(data, () => '');
  },
};

const ANSI_COLORS = {
  unset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function styleToAnsi(style) {
  const color = style.replace(/color:\s*(\w+).*/, '$1').toLowerCase();
  return ANSI_COLORS[color] || '';
}

function resetAnsiStyle(string) {
  return string + ANSI_COLORS.unset;
}

function transformStyles(data, onStyleFound, onStyleApplied) {
  const foundStyles = {};

  return data.reduce((result, item, index, array) => {
    if (foundStyles[index]) {
      return result;
    }

    if (typeof item === 'string') {
      let valueIndex = index;
      let styleApplied = false;

      item = item.replace(/%[1cdfiOos]/g, (match) => {
        valueIndex += 1;

        if (match !== '%c') {
          return match;
        }

        const style = array[valueIndex];
        if (typeof style === 'string') {
          foundStyles[valueIndex] = true;
          styleApplied = true;
          return onStyleFound(style, item);
        }

        return match;
      });

      if (styleApplied && onStyleApplied) {
        item = onStyleApplied(item);
      }
    }

    result.push(item);
    return result;
  }, []);
}


/***/ }),

/***/ "../../src/transforms/transform.js":
/*!*****************************************!*\
  !*** ../../src/transforms/transform.js ***!
  \*****************************************/
/***/ ((module) => {



module.exports = { transform };

function transform({
  logger,
  message,
  transport,

  initialData = message?.data || [],
  transforms = transport?.transforms,
}) {
  return transforms.reduce((data, trans) => {
    if (typeof trans === 'function') {
      return trans({ data, logger, message, transport });
    }

    return data;
  }, initialData);
}


/***/ }),

/***/ "../../src/transports/console.js":
/*!***************************************!*\
  !*** ../../src/transports/console.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* eslint-disable no-console */

const { concatFirstStringElements, format } = __webpack_require__(/*! ../transforms/format */ "../../src/transforms/format.js");
const { maxDepth, toJSON } = __webpack_require__(/*! ../transforms/object */ "../../src/transforms/object.js");
const { applyAnsiStyles, removeStyles } = __webpack_require__(/*! ../transforms/style */ "../../src/transforms/style.js");
const { transform } = __webpack_require__(/*! ../transforms/transform */ "../../src/transforms/transform.js");

const consoleMethods = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  verbose: console.info,
  debug: console.debug,
  silly: console.debug,
  log: console.log,
};

module.exports = consoleTransportFactory;

const separator = process.platform === 'win32' ? '>' : '›';
const DEFAULT_FORMAT = `%c{h}:{i}:{s}.{ms}{scope}%c ${separator} {text}`;

Object.assign(consoleTransportFactory, {
  DEFAULT_FORMAT,
});

function consoleTransportFactory(logger) {
  return Object.assign(transport, {
    format: DEFAULT_FORMAT,
    level: 'silly',
    transforms: [
      addTemplateColors,
      format,
      formatStyles,
      concatFirstStringElements,
      maxDepth,
      toJSON,
    ],
    useStyles: Boolean(process.env.FORCE_STYLES),

    writeFn({ message }) {
      const consoleMethod = consoleMethods[message.level || 'info'];
      consoleMethod(...message.data);
    },
  });

  function transport(message) {
    const data = transform({ logger, message, transport });
    transport.writeFn({
      message: { ...message, data },
    });
  }
}

function addTemplateColors({ data, message, transport }) {
  if (transport.format !== DEFAULT_FORMAT) {
    return data;
  }

  return [`color:${levelToStyle(message.level)}`, 'color:unset', ...data];
}

function canUseStyles(useStyleValue, level) {
  if (typeof useStyleValue === 'boolean') {
    return useStyleValue;
  }

  const useStderr = level === 'error' || level === 'warn';
  const stream = useStderr ? process.stderr : process.stdout;
  return stream && stream.isTTY;
}

function formatStyles(args) {
  const { message, transport } = args;
  const useStyles = canUseStyles(transport.useStyles, message.level);
  const nextTransform = useStyles ? applyAnsiStyles : removeStyles;
  return nextTransform(args);
}

function levelToStyle(level) {
  const map = { error: 'red', warn: 'yellow', info: 'cyan', default: 'unset' };
  return map[level] || map.default;
}


/***/ }),

/***/ "../../src/transports/file/File.js":
/*!*****************************************!*\
  !*** ../../src/transports/file/File.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const EventEmitter = __webpack_require__(/*! events */ "events");
const fs = __webpack_require__(/*! fs */ "fs");
const os = __webpack_require__(/*! os */ "os");

class File extends EventEmitter {
  asyncWriteQueue = [];
  bytesWritten = 0;
  hasActiveAsyncWritting = false;
  path = null;
  initialSize = undefined;
  writeOptions = null;
  writeAsync = false;

  constructor({
    path,
    writeOptions = { encoding: 'utf8', flag: 'a', mode: 0o666 },
    writeAsync = false,
  }) {
    super();

    this.path = path;
    this.writeOptions = writeOptions;
    this.writeAsync = writeAsync;
  }

  get size() {
    return this.getSize();
  }

  clear() {
    try {
      fs.writeFileSync(this.path, '', {
        mode: this.writeOptions.mode,
        flag: 'w',
      });
      this.reset();
      return true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        return true;
      }

      this.emit('error', e, this);
      return false;
    }
  }

  crop(bytesAfter) {
    try {
      const content = readFileSyncFromEnd(this.path, bytesAfter || 4096);
      this.clear();
      this.writeLine(`[log cropped]${os.EOL}${content}`);
    } catch (e) {
      this.emit(
        'error',
        new Error(`Couldn't crop file ${this.path}. ${e.message}`),
        this,
      );
    }
  }

  getSize() {
    if (this.initialSize === undefined) {
      try {
        const stats = fs.statSync(this.path);
        this.initialSize = stats.size;
      } catch (e) {
        this.initialSize = 0;
      }
    }

    return this.initialSize + this.bytesWritten;
  }

  increaseBytesWrittenCounter(text) {
    this.bytesWritten += Buffer.byteLength(text, this.writeOptions.encoding);
  }

  isNull() {
    return false;
  }

  nextAsyncWrite() {
    const file = this;

    if (this.hasActiveAsyncWritting || this.asyncWriteQueue.length < 1) {
      return;
    }

    const text = this.asyncWriteQueue.shift();
    this.hasActiveAsyncWritting = true;

    fs.writeFile(this.path, text, this.writeOptions, function (e) {
      file.hasActiveAsyncWritting = false;

      if (e) {
        file.emit(
          'error',
          new Error(`Couldn't write to ${file.path}. ${e.message}`),
          this,
        );
      } else {
        file.increaseBytesWrittenCounter(text);
      }

      file.nextAsyncWrite();
    });
  }

  reset() {
    this.initialSize = undefined;
    this.bytesWritten = 0;
  }

  toString() {
    return this.path;
  }

  writeLine(text) {
    text += os.EOL;

    if (this.writeAsync) {
      this.asyncWriteQueue.push(text);
      this.nextAsyncWrite();
      return;
    }

    try {
      fs.writeFileSync(this.path, text, this.writeOptions);
      this.increaseBytesWrittenCounter(text);
    } catch (e) {
      this.emit(
        'error',
        new Error(`Couldn't write to ${this.path}. ${e.message}`),
        this,
      );
    }
  }
}

module.exports = File;

function readFileSyncFromEnd(filePath, bytesCount) {
  const buffer = Buffer.alloc(bytesCount);
  const stats = fs.statSync(filePath);

  const readLength = Math.min(stats.size, bytesCount);
  const offset = Math.max(0, stats.size - bytesCount);

  const fd = fs.openSync(filePath, 'r');
  const totalBytes = fs.readSync(fd, buffer, 0, readLength, offset);
  fs.closeSync(fd);

  return buffer.toString('utf8', 0, totalBytes);
}


/***/ }),

/***/ "../../src/transports/file/FileRegistry.js":
/*!*************************************************!*\
  !*** ../../src/transports/file/FileRegistry.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const EventEmitter = __webpack_require__(/*! events */ "events");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const File = __webpack_require__(/*! ./File */ "../../src/transports/file/File.js");
const NullFile = __webpack_require__(/*! ./NullFile */ "../../src/transports/file/NullFile.js");

class FileRegistry extends EventEmitter {
  store = {};

  constructor() {
    super();
    this.emitError = this.emitError.bind(this);
  }

  /**
   * Provide a File object corresponding to the filePath
   * @param {string} filePath
   * @param {WriteOptions} [writeOptions]
   * @param {boolean} [writeAsync]
   * @return {File}
   */
  provide({ filePath, writeOptions, writeAsync = false }) {
    let file;
    try {
      filePath = path.resolve(filePath);

      if (this.store[filePath]) {
        return this.store[filePath];
      }

      file = this.createFile({ filePath, writeOptions, writeAsync });
    } catch (e) {
      file = new NullFile({ path: filePath });
      this.emitError(e, file);
    }

    file.on('error', this.emitError);
    this.store[filePath] = file;
    return file;
  }

  /**
   * @param {string} filePath
   * @param {WriteOptions} writeOptions
   * @param {boolean} async
   * @return {File}
   * @private
   */
  createFile({ filePath, writeOptions, writeAsync }) {
    this.testFileWriting(filePath);
    return new File({ path: filePath, writeOptions, writeAsync });
  }

  /**
   * @param {Error} error
   * @param {File} file
   * @private
   */
  emitError(error, file) {
    this.emit('error', error, file);
  }

  /**
   * @param {string} filePath
   * @private
   */
  testFileWriting(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '', { flag: 'a' });
  }
}

module.exports = FileRegistry;


/***/ }),

/***/ "../../src/transports/file/NullFile.js":
/*!*********************************************!*\
  !*** ../../src/transports/file/NullFile.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const File = __webpack_require__(/*! ./File */ "../../src/transports/file/File.js");

class NullFile extends File {
  clear() {

  }

  crop() {

  }

  getSize() {
    return 0;
  }

  isNull() {
    return true;
  }

  writeLine() {

  }
}

module.exports = NullFile;


/***/ }),

/***/ "../../src/transports/file/index.js":
/*!******************************************!*\
  !*** ../../src/transports/file/index.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const os = __webpack_require__(/*! os */ "os");
const FileRegistry = __webpack_require__(/*! ./FileRegistry */ "../../src/transports/file/FileRegistry.js");
const variables = __webpack_require__(/*! ./variables */ "../../src/transports/file/variables.js");
const { transform } = __webpack_require__(/*! ../../transforms/transform */ "../../src/transforms/transform.js");
const { removeStyles } = __webpack_require__(/*! ../../transforms/style */ "../../src/transforms/style.js");
const { format } = __webpack_require__(/*! ../../transforms/format */ "../../src/transforms/format.js");
const { toString } = __webpack_require__(/*! ../../transforms/object */ "../../src/transforms/object.js");

module.exports = fileTransportFactory;

// Shared between multiple file transport instances
const globalRegistry = new FileRegistry();

function fileTransportFactory(logger, registry = globalRegistry) {
  /** @type {PathVariables} */
  let pathVariables;

  if (registry.listenerCount('error') < 1) {
    registry.on('error', (e, file) => {
      logConsole(`Can't write to ${file}`, e);
    });
  }

  return Object.assign(transport, {
    fileName: getDefaultFileName(logger.variables.processType),
    format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}',
    getFile,
    inspectOptions: {
      depth: 5,
    },
    level: 'silly',
    maxSize: 1024 ** 2,
    readAllLogs,
    sync: true,
    transforms: [removeStyles, format, toString],
    writeOptions: { flag: 'a', mode: 0o666, encoding: 'utf8' },

    archiveLogFn(file) {
      const oldPath = file.toString();
      const inf = path.parse(oldPath);
      try {
        fs.renameSync(oldPath, path.join(inf.dir, `${inf.name}.old${inf.ext}`));
      } catch (e) {
        logConsole('Could not rotate log', e);
        const quarterOfMaxSize = Math.round(transport.maxSize / 4);
        file.crop(Math.min(quarterOfMaxSize, 256 * 1024));
      }
    },

    resolvePathFn(vars) {
      return path.join(vars.libraryDefaultDir, vars.fileName);
    },
  });

  function transport(message) {
    initializeOnFirstLogging();

    const file = getFile(message);

    const needLogRotation = transport.maxSize > 0
      && file.size > transport.maxSize;

    if (needLogRotation) {
      transport.archiveLogFn(file);
      file.reset();
    }

    const content = transform({ logger, message, transport });
    file.writeLine(content);
  }

  function initializeOnFirstLogging() {
    if (pathVariables) {
      return;
    }

    pathVariables = variables.getPathVariables(process.platform);

    if (typeof transport.archiveLog === 'function') {
      transport.archiveLogFn = transport.archiveLog;
      logConsole('archiveLog is deprecated. Use archiveLogFn instead');
    }

    if (typeof transport.resolvePath === 'function') {
      transport.resolvePathFn = transport.resolvePath;
      logConsole('resolvePath is deprecated. Use resolvePathFn instead');
    }
  }

  function logConsole(message, error = null, level = 'error') {
    const data = [`electron-log.transports.file: ${message}`];

    if (error) {
      data.push(error);
    }

    logger.transports.console({ data, date: new Date(), level });
  }

  function getFile(msg) {
    const vars = { ...pathVariables, fileName: transport.fileName };

    const filePath = transport.resolvePathFn(vars, msg);
    return registry.provide({
      filePath,
      writeAsync: !transport.sync,
      writeOptions: transport.writeOptions,
    });
  }

  function readAllLogs({ fileFilter = (f) => f.endsWith('.log') } = {}) {
    const vars = { ...pathVariables, fileName: transport.fileName };
    const logsPath = path.dirname(transport.resolvePathFn(vars));

    return fs.readdirSync(logsPath)
      .map((fileName) => path.join(logsPath, fileName))
      .filter(fileFilter)
      .map((logPath) => {
        try {
          return {
            path: logPath,
            lines: fs.readFileSync(logPath, 'utf8').split(os.EOL),
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }
}

function getDefaultFileName(processType = process.type) {
  switch (processType) {
    case 'renderer': return 'renderer.log';
    case 'worker': return 'worker.log';
    default: return 'main.log';
  }
}


/***/ }),

/***/ "../../src/transports/file/packageJson.js":
/*!************************************************!*\
  !*** ../../src/transports/file/packageJson.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* eslint-disable consistent-return */

const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");

module.exports = {
  readPackageJson,
  tryReadJsonAt,
};

/**
 * @return {{ name?: string, version?: string}}
 */
function readPackageJson() {
  return tryReadJsonAt(__webpack_require__.c[__webpack_require__.s] && __webpack_require__.c[__webpack_require__.s].filename)
    || tryReadJsonAt(extractPathFromArgs())
    || tryReadJsonAt(process.resourcesPath, 'app.asar')
    || tryReadJsonAt(process.resourcesPath, 'app')
    || tryReadJsonAt(process.cwd())
    || { name: null, version: null };
}

/**
 * @param {...string} searchPaths
 * @return {{ name?: string, version?: string } | null}
 */
function tryReadJsonAt(...searchPaths) {
  if (!searchPaths[0]) {
    return null;
  }

  try {
    const searchPath = path.join(...searchPaths);
    const fileName = findUp('package.json', searchPath);
    if (!fileName) {
      return null;
    }

    const json = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    const name = json.productName || json.name;
    if (!name || name.toLowerCase() === 'electron') {
      return null;
    }

    if (json.productName || json.name) {
      return {
        name,
        version: json.version,
      };
    }
  } catch (e) {
    return null;
  }
}

/**
 * @param {string} fileName
 * @param {string} [cwd]
 * @return {string | null}
 */
function findUp(fileName, cwd) {
  let currentPath = cwd;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const parsedPath = path.parse(currentPath);
    const root = parsedPath.root;
    const dir = parsedPath.dir;

    if (fs.existsSync(path.join(currentPath, fileName))) {
      return path.resolve(path.join(currentPath, fileName));
    }

    if (currentPath === root) {
      return null;
    }

    currentPath = dir;
  }
}

/**
 * Get app path from --user-data-dir cmd arg, passed to a renderer process
 * @return {string|null}
 */
function extractPathFromArgs() {
  const matchedArgs = process.argv.filter((arg) => {
    return arg.indexOf('--user-data-dir=') === 0;
  });

  if (matchedArgs.length === 0 || typeof matchedArgs[0] !== 'string') {
    return null;
  }

  const userDataDir = matchedArgs[0];
  return userDataDir.replace('--user-data-dir=', '');
}


/***/ }),

/***/ "../../src/transports/file/variables.js":
/*!**********************************************!*\
  !*** ../../src/transports/file/variables.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const os = __webpack_require__(/*! os */ "os");
const path = __webpack_require__(/*! path */ "path");
const electronApi = __webpack_require__(/*! ../../core/electronApi */ "../../src/core/electronApi.js");
const packageJson = __webpack_require__(/*! ./packageJson */ "../../src/transports/file/packageJson.js");

module.exports = {
  getAppData,
  getLibraryDefaultDir,
  getLibraryTemplate,
  getNameAndVersion,
  getPathVariables,
  getUserData,
};

function getAppData(platform) {
  const appData = electronApi.getPath('appData');
  if (appData) {
    return appData;
  }

  const home = getHome();

  switch (platform) {
    case 'darwin': {
      return path.join(home, 'Library/Application Support');
    }

    case 'win32': {
      return process.env.APPDATA || path.join(home, 'AppData/Roaming');
    }

    default: {
      return process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    }
  }
}

function getHome() {
  return os.homedir ? os.homedir() : process.env.HOME;
}

function getLibraryDefaultDir(platform, appName) {
  if (platform === 'darwin') {
    return path.join(getHome(), 'Library/Logs', appName);
  }

  return path.join(getUserData(platform, appName), 'logs');
}

function getLibraryTemplate(platform) {
  if (platform === 'darwin') {
    return path.join(getHome(), 'Library/Logs', '{appName}');
  }

  return path.join(getAppData(platform), '{appName}', 'logs');
}

function getNameAndVersion() {
  let name = electronApi.getName() || '';
  let version = electronApi.getVersion();

  if (name.toLowerCase() === 'electron') {
    name = '';
    version = '';
  }

  if (name && version) {
    return { name, version };
  }

  const packageValues = packageJson.readPackageJson();
  if (!name) {
    name = packageValues.name;
  }

  if (!version) {
    version = packageValues.version;
  }

  if (!name) {
    // Fallback, otherwise file transport can't be initialized
    name = 'Electron';
  }

  return { name, version };
}

/**
 * @param {string} platform
 * @return {PathVariables}
 */
function getPathVariables(platform) {
  const nameAndVersion = getNameAndVersion();
  const appName = nameAndVersion.name;
  const appVersion = nameAndVersion.version;

  return {
    appData: getAppData(platform),
    appName,
    appVersion,
    electronDefaultDir: electronApi.getPath('logs'),
    home: getHome(),
    libraryDefaultDir: getLibraryDefaultDir(platform, appName),
    libraryTemplate: getLibraryTemplate(platform),
    temp: electronApi.getPath('temp') || os.tmpdir(),
    userData: getUserData(platform, appName),
  };
}

function getUserData(platform, appName) {
  if (electronApi.getName() !== appName) {
    return path.join(getAppData(platform), appName);
  }

  return electronApi.getPath('userData')
    || path.join(getAppData(platform), appName);
}


/***/ }),

/***/ "../../src/transports/remote.js":
/*!**************************************!*\
  !*** ../../src/transports/remote.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const http = __webpack_require__(/*! http */ "http");
const https = __webpack_require__(/*! https */ "https");
const { transform } = __webpack_require__(/*! ../transforms/transform */ "../../src/transforms/transform.js");
const { removeStyles } = __webpack_require__(/*! ../transforms/style */ "../../src/transforms/style.js");
const { toJSON, maxDepth } = __webpack_require__(/*! ../transforms/object */ "../../src/transforms/object.js");

module.exports = remoteTransportFactory;

function remoteTransportFactory(logger) {
  return Object.assign(transport, {
    client: { name: 'electron-application' },
    depth: 6,
    level: false,
    requestOptions: {},
    onError: null,
    transforms: [removeStyles, toJSON, maxDepth],

    makeBodyFn({ message }) {
      return JSON.stringify({
        client: transport.client,
        data: message.data,
        date: message.date.getTime(),
        level: message.level,
        scope: message.scope,
        variables: message.variables,
      });
    },
  });

  function transport(message) {
    if (!transport.url) {
      return;
    }

    const body = transport.makeBodyFn({
      logger,
      message: { ...message, data: transform({ logger, message, transport }) },
      transport,
    });

    const request = post(
      transport.url,
      transport.requestOptions,
      Buffer.from(body, 'utf8'),
    );

    request.on('error', transport.onError || onError);

    function onError(error) {
      logger.processMessage(
        {
          data: [`electron-log: can't POST ${transport.url}`, error],
          level: 'warn',
        },
        { transports: ['console', 'file'] },
      );
    }
  }
}

function post(serverUrl, requestOptions, body) {
  const httpTransport = serverUrl.startsWith('https:') ? https : http;

  const request = httpTransport.request(serverUrl, {
    method: 'POST',
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
      ...requestOptions.headers,
    },
  });

  request.write(body);
  request.end();

  return request;
}


/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__(__webpack_require__.s = "./main.js");
/******/ 	
/******/ })()
;