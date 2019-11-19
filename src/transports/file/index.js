'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var format = require('../../format');
var FileRegistry = require('./file').FileRegistry;
var variables = require('./variables');

module.exports = fileTransportFactory;

// Shared between multiple file transport instances
var globalRegistry = new FileRegistry();

function fileTransportFactory(electronLog, customRegistry) {
  var pathVariables = variables.getPathVariables(process.platform);
  var fileName = process.type === 'renderer' ? 'renderer.log' : 'main.log';

  var registry = customRegistry || globalRegistry;
  registry.on('error', function (e, file) {
    logConsole('Can\'t write to ' + file, e);
  });

  transport.archiveLog   = archiveLog;
  transport.fileName     = fileName;
  transport.format       = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
  transport.getFile      = getFile;
  transport.level        = 'silly';
  transport.maxSize      = 1024 * 1024;
  transport.resolvePath  = resolvePath;
  transport.sync         = true;
  transport.writeOptions = {
    flag: 'a',
    mode: 438, // 0666
    encoding: 'utf8'
  };

  initDeprecated();

  return transport;

  function transport(msg) {
    var file = getFile(msg);

    var needLogRotation = transport.maxSize > 0
      && file.size > transport.maxSize;

    if (needLogRotation) {
      transport.archiveLog(file);
      file.reset();
    }

    file.writeLine(format.format(msg, transport.format, electronLog, true));
  }

  function archiveLog(file) {
    file = file.toString();
    var info = path.parse(file);
    try {
      fs.renameSync(file, path.join(info.dir, info.name + '.old' + info.ext));
    } catch (e) {
      logConsole('Could not rotate log', e);
    }
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

  function getFile(msg) {
    var vars = Object.assign({}, pathVariables, {
      fileName: transport.fileName
    });

    var filePath = transport.resolvePath(vars, msg);
    return registry.provide(filePath, transport.writeOptions, !transport.sync);
  }

  /**
   * @param {IPathVariables} vars
   */
  function resolvePath(vars) {
    return path.join(vars.libraryDefaultDir, vars.fileName);
  }

  function initDeprecated() {
    var isDeprecatedText = ' is deprecated and will be removed in v5.';
    var isDeprecatedProp = ' property' + isDeprecatedText;

    Object.defineProperties(transport, {
      bytesWritten: {
        get: util.deprecate(getBytesWritten, 'bytesWritten' + isDeprecatedProp)
      },

      file: {
        get: util.deprecate(getLogFile, 'file' + isDeprecatedProp),
        set: util.deprecate(setLogFile, 'file' + isDeprecatedProp)
      },

      fileSize: {
        get: util.deprecate(getFileSize, 'file' + isDeprecatedProp)
      }
    });

    transport.clear = util.deprecate(clear, 'clear()' + isDeprecatedText);
    transport.findLogPath = util.deprecate(
      getLogFile,
      'findLogPath()' + isDeprecatedText
    );
    transport.init = util.deprecate(init, 'init()' + isDeprecatedText);

    function getBytesWritten() {
      return getFile().bytesWritten;
    }

    function getLogFile() {
      return getFile().path;
    }

    function setLogFile(filePath) {
      transport.resolvePath = function () {
        return filePath;
      };
    }

    function getFileSize() {
      return getFile().size;
    }

    function clear() {
      getFile().clear();
    }

    function init() {}
  }
}
