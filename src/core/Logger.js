'use strict';

const ErrorHandler = require('./ErrorHandler');
const { initialize } = require('./initialize');
const scopeFactory = require('./scope');

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

  create(options) {
    if (typeof options === 'string') {
      options = { logId: options };
    }

    return new Logger({
      ...options,
      isDev: this.isDev,
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
    if (message.cmd === 'errorHandler') {
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
