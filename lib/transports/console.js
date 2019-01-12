'use strict';

/* eslint-disable no-multi-spaces */

var format = require('../format');

var original = {
  context: console,
  error:   console.error,
  warn:    console.warn,
  info:    console.info,
  verbose: console.verbose,
  debug:   console.debug,
  silly:   console.silly,
  log:     console.log
};

module.exports = consoleTransportFactory;

function consoleTransportFactory(electronLog) {
  transport.level  = 'silly';

  if (process.type === 'renderer') {
    transport.format = '{h}:{i}:{s}.{ms} › {text}';
  } else {
    transport.format = '%c{h}:{i}:{s}.{ms}%c › {text}';
  }

  return transport;

  function transport(msg) {
    var text = format.format(msg, transport.format, electronLog);

    if (process.type === 'renderer') {
      consoleLog(msg.level, [text].concat(msg.styles));
    } else {
      var styles = msg.styles;

      if (transport.format.substr && transport.format.substr(0, 2) === '%c') {
        styles = ['color:' + levelToStyle(msg.level), 'color:unset']
          .concat(styles);
      }

      consoleLog(msg.level, [applyAnsiStyles(text, styles)]);
    }
  }
}

function applyAnsiStyles(text, styles) {
  styles.forEach(function (style) {
    text = text.replace('%c', cssToAnsi(style));
  });

  return text + '\x1b[0m';
}

function consoleLog(level, args) {
  if (original[level]) {
    original[level].apply(original.context, args);
  } else {
    original.log.apply(original.context, args);
  }
}

function cssToAnsi(style) {
  var color = style.replace(/color:\s*(\w+).*/, '$1').toLowerCase();

  switch (color) {
    case 'unset':   return '\x1b[0m';
    case 'black':   return '\x1b[30m';
    case 'red':     return '\x1b[31m';
    case 'green':   return '\x1b[32m';
    case 'yellow':  return '\x1b[33m';
    case 'blue':    return '\x1b[34m';
    case 'magenta': return '\x1b[35m';
    case 'cyan':    return '\x1b[36m';
    case 'white':   return '\x1b[37m';
    default:        return '';
  }
}

function levelToStyle(level) {
  switch (level) {
    case 'error':    return 'red';
    case 'warn':     return 'yellow';
    case 'info':     return 'cyan';
    default:         return 'unset';
  }
}
