'use strict';

var format = require('../format');

transport.level  = 'silly';
transport.format = formatFn;

module.exports = transport;

function transport(msg) {
  var text = format.format(msg, transport.format);
  if (console[msg.level]) {
    console[msg.level](text);
  } else {
    console.log(text);
  }
}

function formatFn(msg) {
  const format_str = '[{h}:{i}:{s}.{ms}] [{level}] {text}';
  return format.format(format.stringifyArray(msg.data), format_str);
}
