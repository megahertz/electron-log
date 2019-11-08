'use strict';

var fs          = require('fs');
var EOL         = require('os').EOL;
var path        = require('path');
var format      = require('../../format');
var findLogPath = require('./findLogPath');

module.exports = fileTransportFactory;

function fileTransportFactory(electronLog) {
  transport.appName      = null;
  transport.archiveLog   = archiveLog;
  transport.bytesWritten = 0;
  transport.file         = null;
  transport.fileName     = 'log.log';
  transport.fileSize     = null;
  transport.format       = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
  transport.level        = 'silly';
  transport.maxSize      = 1024 * 1024;
  transport.sync         = true;
  transport.writeOptions = {
    flag: 'a',
    mode: 438, // 0666
    encoding: 'utf8'
  };

  transport.clear       = clear;
  transport.findLogPath = findCurrentLogPath.bind(null, transport);
  transport.init        = init;

  return transport;

  function transport(msg) {
    if (!transport.file || transport.fileSize === null) {
      init(transport);
    }

    var needLogRotation = transport.maxSize > 0
      && transport.fileSize + transport.bytesWritten > transport.maxSize;

    if (needLogRotation) {
      transport.archiveLog(transport.file);
      init(transport);
    }

    var text = format.format(msg, transport.format, electronLog, true);
    write(text + EOL, transport);
  }

  function init(transp) {
    transp = transp || transport;

    transp.file = findCurrentLogPath(transp);

    if (!transp.file) {
      transp.level = false;
      logConsole('Could not set a log file');
      return;
    }

    try {
      transp.fileSize = fs.statSync(transp.file).size;
    } catch (e) {
      transp.fileSize = 0;
    }

    transp.bytesWritten = 0;
  }

  function write(text, transp) {
    if (transp.sync) {
      try {
        fs.writeFileSync(transp.file, text, transp.writeOptions);
        incCounter(text, transp);
      } catch (e) {
        logConsole('Couldn\'t write to ' + transp.file, e);
      }
    } else {
      fs.writeFile(transp.file, text, transp.writeOptions, function (e) {
        if (e) {
          logConsole('Couldn\'t write to ' + transp.file, e);
        } else {
          incCounter(text, transp);
        }
      });
    }
  }

  function incCounter(text, transp) {
    transp.bytesWritten += Buffer.byteLength(
      text,
      transp.writeOptions.encoding
    );
  }

  function archiveLog(file) {
    var info = path.parse(file);
    try {
      fs.renameSync(file, path.join(info.dir, info.name + '.old' + info.ext));
    } catch (e) {
      logConsole('Could not rotate log', e);
    }
  }

  function clear() {
    try {
      fs.unlinkSync(transport.file);
    } catch (e) {
      logConsole('Could not clear log', e);
    }
  }

  function findCurrentLogPath(transp) {
    return transp.file
      || findLogPath(transp.appName, transp.fileName);
  }

  function logConsole(message, error) {
    var data = ['electron-log.transports.file: ' + message];

    if (error) {
      data.push(error);
    }

    electronLog.transports.console({
      data: data,
      date: new Date(),
      level: 'warn'
    });
  }
}
