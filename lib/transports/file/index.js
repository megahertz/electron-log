'use strict';

var fs               = require('fs');
var EOL              = require('os').EOL;
var format           = require('../../format');
var consoleTransport = require('../console');
var findLogPath      = require('./find-log-path');

transport.findLogPath  = findLogPath;
transport.format       = formatFn;
transport.level        = 'warn';
transport.maxSize      = 1024 * 1024;
transport.streamConfig = undefined;

module.exports = transport;

function transport(msg) {
  var text = format.format(msg, transport.format);

  if (undefined === transport.stream) {
    transport.file = transport.file || findLogPath(transport.appName);
    if (!transport.file) {
      transport.level = false;
      consoleTransport({
        data: ['electron-log.transports.file: Could not set a log file'],
        date: msg.date,
        level: 'warn'
      });
      return;
    }

    if (transport.maxSize > 0) {
      logRotate(transport.file, transport.maxSize);
    }

    transport.stream = fs.createWriteStream(
      transport.file,
      transport.streamConfig || { flags: 'a' }
    );
  }

  transport.stream.write(text + EOL);
}

function formatFn(msg) {
  var date =
    msg.date.getFullYear() + '-' +
    format.pad(msg.date.getMonth() + 1) + '-' +
    format.pad(msg.date.getDate()) + ' ' +
    format.pad(msg.date.getHours()) + ':' +
    format.pad(msg.date.getMinutes()) + ':' +
    format.pad(msg.date.getSeconds()) + ':' +
    format.pad(msg.date.getMilliseconds(), 4);

  return '[' + date + '] [' + msg.level + '] ' +
    format.stringifyArray(msg.data);
}

function logRotate(file, maxSize) {
  try {
    const stat = fs.statSync(file);
    if (stat.size > maxSize) {
      fs.renameSync(file, file.replace(/log$/, 'old.log'));
    }
  } catch (e) {}
}