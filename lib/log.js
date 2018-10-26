'use strict';

log.compareLevels = compareLevels;
module.exports = log;

function log(electronLog, level) {
  var transports = filterTransportsByLevel(electronLog, level);

  for (var i in transports) {
    if (!transports.hasOwnProperty(i) || typeof transports[i] !== 'function') {
      continue;
    }

    var msg = runHooks(electronLog.hooks, transports[i], {
      data: Array.prototype.slice.call(arguments, 2),
      date: new Date(),
      level: level,
      variables: electronLog.variables
    });

    if (msg) {
      transports[i](msg);
    }
  }
}

function filterTransportsByLevel(electronLog, level) {
  var transports = electronLog.transports;
  var levels = electronLog.levels;

  var filtered = {};

  for (var i in transports) {
    if (!transports.hasOwnProperty(i)) continue;
    if (!transports[i]) continue;
    if (transports[i].level === false) continue;
    if (!compareLevels(levels, transports[i].level, level)) continue;

    filtered[i] = transports[i];
  }

  return filtered;
}

function compareLevels(levels, passLevel, checkLevel) {
  var pass = levels.indexOf(passLevel);
  var check = levels.indexOf(checkLevel);
  if (check === -1 || pass === -1) {
    return true;
  }

  return check <= pass;
}

function runHooks(hooks, transport, msg) {
  if (!hooks || !hooks.length) {
    return msg;
  }

  // eslint-disable-next-line no-plusplus
  for (var i = 0; i < hooks.length; i++) {
    msg = hooks[i](msg, transport);
    if (!msg) break;
  }

  return msg;
}
