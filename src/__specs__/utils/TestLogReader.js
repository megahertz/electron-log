'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var rmDir = require('./fsHelpers').rmDir;

module.exports = TestLogReader;

function TestLogReader() {
  this.items = [];
  this.appName = null;
}

TestLogReader.getDefaultLogDir = function (appName) {
  switch (process.platform) {
    case 'darwin': {
      return path.resolve(os.homedir(), 'Library/Logs', appName);
    }
    case 'win32': {
      return path.resolve(os.homedir(), 'AppData/Roaming', appName, 'logs');
    }
    default: {
      return path.resolve(os.homedir(), '.config', appName, 'logs');
    }
  }
};

TestLogReader.removeDefaultLogDir = function (appName) {
  var dir = this.getDefaultLogDir(appName);

  if (process.platform !== 'darwin') {
    dir = path.dirname(dir);
  }

  rmDir(dir);
};

TestLogReader.fromApp = function (appName) {
  var reader = new this();
  reader.loadFilesFromDefaultDir(appName);
  reader.appName = appName;
  return reader;
};

TestLogReader.fromFile = function (logFilePath) {
  var reader = new this();
  reader.loadFile(logFilePath);
  return reader;
};

TestLogReader.prototype.format = function (template) {
  template = template || '{fileName}: {text}';

  return this.items.map(function (item) {
    return template
      .replace('{date}', item.date)
      .replace('{fileName}', item.fileName)
      .replace('{level}', item.level)
      .replace('{text}', item.text);
  });
};

TestLogReader.prototype.loadFile = function (filePath) {
  var fileName = path.basename(filePath);
  var content = fs.readFileSync(filePath, 'utf8');

  var items = content.split(os.EOL)
    .filter(Boolean)
    .reduce(function (result, line) {
      var matches = line.match(/\[([\w.: -]+)] \[(\w+)]  ?([\s\S]*)/);
      if (matches) {
        return result.concat({
          date: matches[1],
          fileName: fileName,
          level: matches[2],
          text: matches[3],
        });
      }

      var lastItem = result[result.length - 1];
      if (lastItem) {
        lastItem.text += '\n' + line;
      }

      return result;
    }, [])
    .filter(Boolean);

  this.items = this.items.concat(items);
};

TestLogReader.prototype.loadFilesFromDefaultDir = function (appName) {
  var defaultLogDir = this.constructor.getDefaultLogDir(appName);
  var logs = fs.readdirSync(defaultLogDir);
  logs.forEach(function (logFileName) {
    this.loadFile(path.join(defaultLogDir, logFileName));
  }, this);
};

TestLogReader.prototype.removeLogDir = function () {
  if (this.appName) {
    this.constructor.removeDefaultLogDir(this.appName);
  }
};
