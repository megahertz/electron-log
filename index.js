'use strict';

var fs   = require('fs');
var path = require('path');
var util = require('util');


var LEVELS = [ 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ];

/**
 * @param {string} text
 * @name module.exports.error
 */
/**
 * @param {string} text
 * @name module.exports.warn
 */
/**
 * @param {string} text
 * @name module.exports.info
 */
/**
 * @param {string} text
 * @name module.exports.verbose
 */
/**
 * @param {string} text
 * @name module.exports.debug
 */
/**
 * @param {string} text
 * @name module.exports.silly
 */

module.exports.log = log;

module.exports.format = formatFile;

module.exports.transports = {};
module.exports.transports.console = transportConsole;
module.exports.transports.console.format = formatConsole;
module.exports.transports.console.level = 'silly';

module.exports.transports.file = transportFile;
module.exports.transports.file.format = formatFile;
module.exports.transports.file.level = 'warning';

module.exports.findLogPath = findLogPath;

for (var i = 0; i < LEVELS.length; i++) {
  module.exports[LEVELS[i]] = log.bind(module.exports, LEVELS[i]);
}

/**
 * @param {string} level
 * @param {string} text
 */
function log(level, text) {
  if (typeof text !== 'string') {
    text = util.inspect(text);
  }
  
  var msg = {
    level: level,
    text: text,
    date: new Date()
  };
  
  var transports = module.exports.transports;
  for (var i in transports) {
    // jshint -W089
    if (!transports.hasOwnProperty(i) || typeof transports[i] !== 'function') {
      return;
    }
    if (!compareLevels(transports[i].level, level)) {
      return;
    }
    transports[i].call(module.exports, msg);
  }
}

function compareLevels(passLevel, checkLevel) {
  var pass = LEVELS.indexOf(passLevel);
  var check = LEVELS.indexOf(checkLevel);
  if (check === -1 || pass === -1) {
    return true;
  }
  return check <= pass;
}

// region transport
function transportConsole(msg) {
  var text = format(msg, transportConsole.format || module.exports.format);
  console.log(text);
}

function transportFile(msg) {
  var text = format(msg, transportFile.format || module.exports.format);
  var eol = process.platform === 'win32' ? '\r\n' : '\n';

  if (!transportFile.stream) {
    transportFile.stream = fs.createWriteStream(
      transportFile.file || findLogPath(),
      transportFile.streamConfig || { flags: 'a' }
    );
  }

  transportFile.stream.write(text + eol);
}
// endregion transport

// region get log path
/**
 * Try to determine a platform-specific path where can write logs
 * @param {string} [appName] App name, path-safe, loads by package.json by default
 * @return {string|boolean}
 */
function findLogPath(appName) {
  if (!appName) {
    try {
      var appPkg = loadAppPackage();
      appName = appPkg.name;
    } catch (e) {
      return false;
    }
  }

  var dir;
  switch (process.platform) {
    case 'linux':
      dir = prepareDir(process.env['XDG_CACHE_HOME'], appName)
        .or(process.env['HOME'] + '/.cache', appName)
        .or(process.env['XDG_DATA_HOME'], appName)
        .or(process.env['HOME'] + '/.local/share', appName)
        .result;
      break;
    case 'darwin':
      dir = prepareDir(process.env['HOME'] + '/Library/Caches', appName)
        .or(process.env['HOME'] + '/Library/Application Support', appName)
        .result;
      break;
    case 'win32':
      dir = prepareDir(process.env['APPDATA'], appName)
        .or(process.env['HOME'] + '/AppData', appName)
        .result;
      break;
  }

  if (dir) {
    return dir + '/' + 'log.log';
  } else {
    return false;
  }

  function prepareDir(path, appName) {
    if (!this || this.or !== prepareDir || !this.result) {
      if (!path) {
        return { or: prepareDir };
      }
      path = path + '/' + appName;
      mkDir(path);
      try {
        fs.accessSync(path, fs.W_OK);
      } catch (e) {
        return { or: prepareDir };
      }
    }

    return { 
      or: prepareDir,
      result: (this ? this.result : false) || path
    };
  }

  function mkDir(path, root) {
    var dirs = path.split('/');
    var dir = dirs.shift();
    root = (root || '') + dir + '/';

    try {
      fs.mkdirSync(root);
    }
    catch (e) {
      if (!fs.statSync(root).isDirectory()) {
        throw new Error(e);
      }
    }

    return !dirs.length || mkDir(dirs.join('/'), root);
  }

  /**
   * Try to load main app package
   * @throws {Error}
   * @return {Object}
   */
  function loadAppPackage() {
    var packageFile = path.dirname(require.main.filename) + '/package.json';
    fs.statSync(packageFile);
    return require(packageFile);
  }
}
// endregion get log path

// region formatter
function format(msg, formatter) {
  if (typeof formatter === 'function') {
    return formatter(msg);
  }

  var date = msg.date;

  return formatter
    .replace('{level}', msg.level)
    .replace('{text}', msg.text)
    .replace('{y}', date.getFullYear())
    .replace('{m}', pad(date.getMonth()))
    .replace('{d}', pad(date.getDate()))
    .replace('{h}', pad(date.getHours()))
    .replace('{i}', pad(date.getMinutes()))
    .replace('{s}', pad(date.getSeconds()))
    .replace('{ms}', pad(date.getMilliseconds(), 4));
}

function formatConsole(msg) {
  var time =
    pad(msg.date.getHours()) + ':' +
    pad(msg.date.getMinutes()) + ':' +
    pad(msg.date.getSeconds()) + ':' +
    pad(msg.date.getMilliseconds(), 4);

  return '[' + time + '] [' + msg.level + '] ' + msg.text;
}

function formatFile(msg) {
  var date = 
    msg.date.getFullYear() + '-' +
    pad(msg.date.getMonth()) + '-' +
    pad(msg.date.getDate()) + ' ' +
    pad(msg.date.getHours()) + ':' +
    pad(msg.date.getMinutes()) + ':' +
    pad(msg.date.getSeconds()) + ':' +
    pad(msg.date.getMilliseconds(), 4);

  return '[' + date + '] [' + msg.level + '] ' + msg.text;
}

function pad(number, zeros) {
  zeros = zeros || 2;
  return (new Array(zeros + 1).join('0') + number).substr(-zeros, zeros);
}
// endregion formatter