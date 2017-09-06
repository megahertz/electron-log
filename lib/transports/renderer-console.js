'use strict';

var BrowserWindow;
try {
  BrowserWindow = require('electron').BrowserWindow;
} catch (e) {
  BrowserWindow = null;
}

var format = require('../format');

transport.level  = BrowserWindow ? 'silly' : false;
transport.format = formatFn;

module.exports = transport;

function transport(msg) {
  if (!BrowserWindow) return;

  var text = format.format(msg, transport.format);
  BrowserWindow.getAllWindows().forEach(function(wnd) {
    wnd.webContents.send('__ELECTRON_LOG_RENDERER__', msg.level, text);
  });
}

function formatFn(msg) {
  const format_str = '[{h}:{i}:{s}.{ms}] {text}';
  return format.format(format.stringifyArray(msg.data), format_str);
}
