'use strict';

var util = require('util');

module.exports = {
  format: format,
  formatTimeZone: formatTimeZone,
  pad: pad,
  stringifyObject: stringifyObject
};

/**
 * Transform Message object to a string
 * @param {object} msg
 * @param {string|function} formatter
 * @param {object} electronLog
 * @param {boolean} [removeStyles=false]
 * @return {string}
 */
function format(msg, formatter, electronLog, removeStyles) {
  removeStyles = removeStyles !== undefined ? removeStyles : false;

  if (typeof formatter === 'function') {
    return formatter(msg, electronLog);
  }

  var date = new Date(msg.date || Date.now());
  var variables = msg.variables;
  var result = formatter;

  for (var i in variables) {
    if (!variables.hasOwnProperty(i)) continue;
    result = result.replace('{' + i + '}', variables[i]);
  }

  result = result
    .replace('{level}', msg.level)
    .replace('{text}', stringifyArray(msg.data))
    .replace('{y}', String(date.getFullYear()))
    .replace('{m}', pad(date.getMonth() + 1))
    .replace('{d}', pad(date.getDate()))
    .replace('{h}', pad(date.getHours()))
    .replace('{i}', pad(date.getMinutes()))
    .replace('{s}', pad(date.getSeconds()))
    .replace('{ms}', pad(date.getMilliseconds(), 3))
    .replace('{z}', formatTimeZone(date.getTimezoneOffset()));

  if (removeStyles) {
    result = result.replace(/%c/g, '');
  }

  return result;
}

function stringifyArray(data) {
  return util.format.apply(util, data.map(stringifyObject));
}

function stringifyObject(data) {
  if (typeof data === 'function') {
    return data.toString();
  }

  if (data instanceof Error) {
    return data.stack;
  }

  return data;
}

function pad(number, zeros) {
  zeros = zeros || 2;
  return (new Array(zeros + 1).join('0') + number).substr(-zeros, zeros);
}

function formatTimeZone(minutesOffset) {
  var m = Math.abs(minutesOffset);
  return (minutesOffset >= 0 ? '-' : '+')
    + pad(Math.floor(m / 60)) + ':'
    + pad(m % 60);
}
