'use strict';

/* eslint-disable no-multi-spaces, no-console */

var transform = require('../transform');

var original = {
  context: console,
  error:   console.error,
  warn:    console.warn,
  info:    console.info,
  verbose: console.verbose,
  debug:   console.debug,
  silly:   console.silly,
  log:     console.log,
};

module.exports = consoleTransportFactory;

var separator = process.platform === 'win32' ? '>' : '›';
var DEFAULT_FORMAT = {
  browser: '%c{h}:{i}:{s}.{ms}%c ' + separator + ' {text}',
  renderer: '{h}:{i}:{s}.{ms} › {text}',
  worker: '{h}:{i}:{s}.{ms} › {text}',
};

function consoleTransportFactory() {
  transport.level  = 'silly';
  transport.forceStyles = Boolean(process.env.FORCE_STYLES);
  transport.format = DEFAULT_FORMAT[process.type] || DEFAULT_FORMAT.browser;

  return transport;

  function transport(message) {
    if (process.type === 'renderer' || process.type === 'worker') {
      var content = transform.transform(message, [
        transform.customFormatterFactory(transport.format),
      ]);
      consoleLog(message.level, content);
      return;
    }

    var useStyles = transport.forceStyles || canUseStyles(message.level);

    var styledContent = transform.transform(message, [
      addTemplateColorFactory(transport.format),
      transform.customFormatterFactory(transport.format),
      useStyles ? transform.applyAnsiStyles : transform.removeStyles,
      transform.maxDepthFactory(10),
      transform.toJSON,
    ]);

    consoleLog(message.level, styledContent);
  }
}

function addTemplateColorFactory(format) {
  return function addTemplateColors(data, message) {
    if (format !== DEFAULT_FORMAT.browser) {
      return data;
    }

    return ['color:' + levelToStyle(message.level), 'color:unset'].concat(data);
  };
}

function canUseStyles(level) {
  var useStderr = level === 'error' || level === 'warn';
  var stream = useStderr ? process.stderr : process.stdout;
  return stream && stream.isTTY;
}

function consoleLog(level, args) {
  if (original[level]) {
    original[level].apply(original.context, args);
  } else {
    original.log.apply(original.context, args);
  }
}

function levelToStyle(level) {
  switch (level) {
    case 'error': return 'red';
    case 'warn':  return 'yellow';
    case 'info':  return 'cyan';
    default:      return 'unset';
  }
}
