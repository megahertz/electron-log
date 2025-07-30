'use strict';

/* eslint-disable no-console */

const {
  concatFirstStringElements,
  format,
} = require('../../core/transforms/format');
const { maxDepth, toJSON } = require('../transforms/object');
const {
  applyAnsiStyles,
  removeStyles,
} = require('../../core/transforms/style');
const { transform } = require('../../core/transforms/transform');

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
    colorMap: {
      error: 'red',
      warn: 'yellow',
      info: 'cyan',
      verbose: 'unset',
      debug: 'gray',
      silly: 'gray',
      default: 'unset',
    },
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
    useStyles: process.env.FORCE_STYLES,

    writeFn({ message }) {
      const consoleLogFn = consoleMethods[message.level] || consoleMethods.info;
      consoleLogFn(...message.data);
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
  if (
    typeof transport.format !== 'string'
    || !transport.format.includes('%c')
  ) {
    return data;
  }

  return [
    `color:${levelToStyle(message.level, transport)}`,
    'color:unset',
    ...data,
  ];
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

function levelToStyle(level, transport) {
  return transport.colorMap[level] || transport.colorMap.default;
}
