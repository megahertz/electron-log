'use strict';

var path = require('path');
var TestLogReader = require('../src/__specs__/utils/TestLogReader');
var exec = require('child_process').exec;

module.exports = {
  /**
   * @param {string} appName
   * @param {number} timeout
   * @return {Promise<TestLogReader>}
   */
  run: function (appName, timeout) {
    timeout = timeout || 15000;

    var self = this;
    var logReader;

    return Promise.resolve()
      .then(function () { return self.removeLogDir(appName) })
      .then(function () { return self.runApplication(appName, timeout) })
      .then(function () { logReader = self.readLog(appName) })
      .then(function () { return self.removeLogDir(appName) })
      .then(function () { return logReader });
  },

  readLog: function (appName) {
    var reader = TestLogReader.fromApp('electron-log-test-' + appName);
    reader.removeLogDir();
    return reader;
  },

  removeLogDir: function (appName) {
    TestLogReader.removeDefaultLogDir(appName);
  },

  runApplication: function (appName, timeout) {
    return new Promise(function (resolve, reject) {
      var timeoutId;
      var isFinished = false;
      var output = [];

      var cwd = path.join(__dirname, appName);
      var app = exec('npm start -- --test', {
        cwd: cwd,
        env: Object.assign({}, process.env, { FORCE_STYLES: true }),
      }, done);
      collectOutput(app.stdout);
      collectOutput(app.stderr);

      timeoutId = setTimeout(function () {
        done(new Error(
          'Terminate ' + appName + ' by timeout (' + (timeout / 1000) + 's)'
        ));
        app.kill('SIGKILL');
      }, timeout - 100);

      function done(error) {
        if (isFinished) return;

        isFinished = true;
        clearTimeout(timeoutId);

        var outputText = output
          .join('\n')
          .replace(/^Fontconfig.*$/mg, '')
          .replace(/^.*Desktop Identity.*$/mg, '')
          .replace(/^\n/mg, '');

        // eslint-disable-next-line no-console
        console.debug ? console.debug(outputText) : console.log(outputText);

        error ? reject(error) : resolve();
      }

      function collectOutput(pipe) {
        pipe.on('data', function (chunk) { output.push(chunk.toString()) });
      }
    });
  },
};
