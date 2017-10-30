'use strict';

var format          = require('../format');
var originalConsole = require('../original-console');

transport.level  = 'silly';
transport.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';

module.exports = transport;

function transport(msg) {
  var text = format.format(msg, transport.format);
  if (originalConsole[msg.level]) {
    originalConsole[msg.level](text);
  } else {
    originalConsole.log(text);
  }
}

