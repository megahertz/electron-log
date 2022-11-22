'use strict';

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
  ({ contextBridge, ipcRenderer } = require('electron'));
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
