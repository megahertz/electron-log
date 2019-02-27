'use strict';

var fs   = require('fs');
var path = require('path');
var exec = require('child_process').exec;

module.exports = {
  runApplication: function (appName, timeout) {
    return new Promise(function (resolve, reject) {
      var timeoutId;
      var app = exec(
        'npm start -- --test',
        { cwd: path.join(__dirname, appName) },
        function (error, stdout, stderr) {
          clearInterval(timeoutId);

          if (console.debug) {
            console.debug(stdout, stderr);
          } else {
            console.log(stdout, stderr);
          }

          error ? reject(error) : resolve();
        }
      );

      timeoutId = setTimeout(function () {
        app.kill();
        console.warn('Terminate ' + appName + ' by timeout.');
      }, timeout);
    });
  },

  readLog: function (appName) {
    var logPath = path.join(getLogPath(appName), 'log.log');
    return new Promise(function (resolve, reject) {
      fs.readFile(logPath, 'utf8', function (error, data) {
        if (error) return reject(error);
        resolve(data.split('\n'));
      });
    });
  },

  removeLogDir: function (appName) {
    var logDir = getLogPath(appName);
    if (!logDir) {
      return Promise.reject('Could not get log path');
    }

    return new Promise(function (resolve) {
      var cmd = process.platform === 'win32' ? 'rd /s /q' : 'rm -rf';
      exec(cmd + ' ' + logDir, function (error) {
        if (error) {
          console.warn(error.message);
        }

        resolve();
      });
    });
  },

  run: function (appName, timeout = 15000) {
    var logs;
    var self = this;

    return Promise.resolve()
      .then(function () { return self.removeLogDir(appName) })
      .then(function () { return self.runApplication(appName, timeout) })
      .then(function () { return self.readLog(appName) })
      .then(function (lines) { logs = lines })
      .then(function () { return self.removeLogDir(appName) })
      .then(function () { return logs });
  }
};

function getLogPath(appName) {
  if (!appName) return false;

  var home = process.env.HOME;

  appName = 'electron-log-test-' + appName;

  switch (process.platform) {
    case 'linux': {
      if (!home) return false;
      return path.join(home, '.config', appName);
    }

    case 'darwin': {
      if (!home) return false;
      return path.join(home, 'Library/Logs', appName);
    }

    default: {
      if (!process.env.APPDATA) return false;
      return path.join(process.env.APPDATA, appName);
    }
  }
}
