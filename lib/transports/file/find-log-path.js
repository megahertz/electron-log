'use strict';

var fs   = require('fs');
var path = require('path');
var getAppName = require('./get-app-name');

module.exports = findLogPath;

/**
 * Try to determine a platform-specific path where can write logs
 * @param {string} [appName] Used to determine the last part of a log path
 * @return {string|boolean}
 */
function findLogPath(appName) {
  appName = appName || getAppName();
  if (!appName) {
    return false;
  }

  var dir;
  switch (process.platform) {
    case 'linux': {
      dir = prepareDir(process.env['XDG_CONFIG_HOME'], appName)
        .or(process.env['HOME'], '.config', appName)
        .or(process.env['XDG_DATA_HOME'], appName)
        .or(process.env['HOME'], '.local', 'share', appName)
        .result;
      break;
    }

    case 'darwin': {
      dir = prepareDir(process.env['HOME'], 'Library', 'Logs', appName)
        .or(process.env['HOME'], 'Library', 'Application Support', appName)
        .result;
      break;
    }

    case 'win32': {
      dir = prepareDir(process.env['APPDATA'], appName)
        .or(process.env['USERPROFILE'], 'AppData', 'Roaming', appName)
        .result;
      break;
    }
  }

  if (dir) {
    return path.join(dir, 'log.log');
  } else {
    return false;
  }
}



function prepareDir(dirPath) {
  // jshint -W040
  if (!this || this.or !== prepareDir || !this.result) {
    if (!dirPath) {
      return { or: prepareDir };
    }

    //noinspection JSCheckFunctionSignatures
    dirPath = path.join.apply(path, arguments);
    mkDir(dirPath);

    try {
      fs.accessSync(dirPath, fs.W_OK);
    } catch (e) {
      return { or: prepareDir };
    }
  }

  return {
    or: prepareDir,
    result: (this ? this.result : false) || dirPath
  };
}

function mkDir(dirPath, root) {
  var dirs = dirPath.split(path.sep);
  var dir = dirs.shift();
  root = (root || '') + dir + path.sep;

  try {
    fs.mkdirSync(root);
  } catch (e) {
    if (!fs.statSync(root).isDirectory()) {
      throw new Error(e);
    }
  }

  return !dirs.length || mkDir(dirs.join(path.sep), root);
}