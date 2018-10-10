'use strict';

var format          = require('../format');
var originalConsole = require('../original-console');

module.exports = consoleTransportFactory;

function consoleTransportFactory(electronLog) {
  transport.level  = 'silly';
  transport.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';

  return transport;

  function transport(msg) {
    var text = format.format(msg, transport.format, electronLog);

    if (originalConsole[msg.level]) {
      originalConsole[msg.level](text);
    } else {
      originalConsole.log(text);
    }
  }
}
