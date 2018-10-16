'use strict';

var util = require('util');
var EOL  = require('os').EOL;

module.exports = {
  format: format,
  formatTimeZone: formatTimeZone,
  pad: pad,
  stringifyArray: stringifyArray
};

function format(msg, formatter) {
  if (typeof formatter === 'function') {
    return formatter(msg);
  }

  var date = msg.date;

  return formatter
    .replace('{level}', msg.level)
    .replace('{text}', stringifyArray(msg.data))
    .replace('{context}', process.type)
    .replace('{y}', date.getFullYear())
    .replace('{m}', pad(date.getMonth() + 1))
    .replace('{d}', pad(date.getDate()))
    .replace('{h}', pad(date.getHours()))
    .replace('{i}', pad(date.getMinutes()))
    .replace('{s}', pad(date.getSeconds()))
    .replace('{ms}', pad(date.getMilliseconds(), 3))
    .replace('{z}', formatTimeZone(date.getTimezoneOffset()));
}

function stringifyArray(data) {
  data = data.map(function formatErrors(arg) {
    return arg instanceof Error ? arg.stack + EOL : arg;
  });
  return util.format.apply(util, data);
}

function pad(number, zeros) {
  zeros = zeros || 2;
  return (new Array(zeros + 1).join('0') + number).substr(-zeros, zeros);
}

function formatTimeZone(minutesOffset) {
  var m = Math.abs(minutesOffset);
  return (minutesOffset >= 0 ? '-' : '+') +
    pad(Math.floor(m / 60)) + ':' +
    pad(m % 60);
}
