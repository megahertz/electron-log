'use strict';

var fs         = require('fs');
var path       = require('path');
var os         = require('os');
var utils      = require('../../utils');
var getAppName = require('./getAppName');

module.exports = findLogPath;

/**
 * Try to determine a platform-specific path where can write logs
 * @param {string} [appName] Used to determine the last part of a log path
 * @param {string} [fileName='log.log']
 * @return {string|boolean}
 */
function findLogPath(appName, fileName) {
  fileName = fileName || 'log.log';
  var userData = appName ? null : utils.getUserData();
  appName = appName || getAppName();

  var homeDir = os.homedir ? os.homedir() : process.env.HOME;

  var dir;
  switch (process.platform) {
    case 'darwin': {
      dir = prepareDir(homeDir, 'Library', 'Logs', appName)
        .or(userData)
        .or(homeDir, 'Library', 'Application Support', appName)
        .result;
      break;
    }

    case 'win32': {
      dir = prepareDir(userData)
        .or(process.env.APPDATA, appName)
        .or(homeDir, 'AppData', 'Roaming', appName)
        .result;
      break;
    }

    default: {
      dir = prepareDir(userData)
        .or(process.env.XDG_CONFIG_HOME, appName)
        .or(homeDir, '.config', appName)
        .or(process.env.XDG_DATA_HOME, appName)
        .or(homeDir, '.local', 'share', appName)
        .result;
      break;
    }
  }

  if (dir) {
    return path.join(dir, fileName);
  }

  return false;
}

function prepareDir(dirPath) {
  if (!this || this.or !== prepareDir || !this.result) {
    if (!dirPath) {
      return { or: prepareDir };
    }

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
