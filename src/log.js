'use strict';

module.exports = {
  compareLevels: compareLevels,
  log: log,
  runTransport: runTransport,
};

function log(electronLog, level) {
  var transports = electronLog.transports;

  var payload = splitBodyAndStyle(Array.prototype.slice.call(arguments, 2));
  var message = {
    data: payload.messages,
    date: new Date(),
    level: level,
    variables: electronLog.variables,
    styles: payload.styles,
  };

  for (var i in transports) {
    if (transports.hasOwnProperty(i)) {
      runTransport(transports[i], message, electronLog);
    }
  }
}

function runTransport(transport, message, electronLog) {
  if (typeof transport !== 'function' || transport.level === false) {
    return;
  }

  if (!compareLevels(electronLog.levels, transport.level, message.level)) {
    return;
  }

  message = runHooks(electronLog.hooks, transport, message);

  if (message) {
    transport(message);
  }
}

function compareLevels(levels, passLevel, checkLevel) {
  var pass = levels.indexOf(passLevel);
  var check = levels.indexOf(checkLevel);
  if (check === -1 || pass === -1) {
    return true;
  }

  return check <= pass;
}

function runHooks(hooks, transport, message) {
  if (!hooks || !hooks.length) {
    return message;
  }

  // eslint-disable-next-line no-plusplus
  for (var i = 0; i < hooks.length; i++) {
    message = hooks[i](message, transport);
    if (!message) break;
  }

  return message;
}

function splitBodyAndStyle(messages) {
  var styles = [];

  messages = messages.filter(function (el) {
    if (el && el.substr && el.substr(0, 6) === 'color:') {
      styles.push(el);
      return false;
    }

    return true;
  });

  return { messages: messages, styles: styles };
}
