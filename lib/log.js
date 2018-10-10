'use strict';

var LEVELS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

log.LEVELS = LEVELS;
log.compareLevels = compareLevels;
module.exports = log;

function log(electronLog, level) {
  var transports = filterTransportsByLevel(electronLog.transports, level);
  var msg = transformMsgByHooks(electronLog, transports, {
    data: Array.prototype.slice.call(arguments, 2),
    date: new Date(),
    level: level,
    variables: electronLog.variables
  });

  if (!msg) return;

  for (var i in transports) {
    if (transports.hasOwnProperty(i) && typeof transports[i] === 'function') {
      transports[i].call(null, msg);
    }
  }
}

function filterTransportsByLevel(transports, level) {
  var filtered = {};

  for (var i in transports) {
    if (!transports.hasOwnProperty(i)) continue;
    if (!transports[i]) continue;
    if (!transports[i].level) continue;
    if (!compareLevels(transports[i].level, level)) continue;

    filtered[i] = transports[i];
  }

  return filtered;
}

function compareLevels(passLevel, checkLevel) {
  var pass = LEVELS.indexOf(passLevel);
  var check = LEVELS.indexOf(checkLevel);
  if (check === -1 || pass === -1) {
    return true;
  }

  return check <= pass;
}

function transformMsgByHooks(electronLog, activeTransports, msg) {
  if (!electronLog.hooks || !electronLog.hooks.length) {
    return msg;
  }

  return electronLog.hooks.reduce(function logHook(prevMsg, hook) {
    return prevMsg ? hook(prevMsg, activeTransports) : prevMsg;
  }, msg);
}
