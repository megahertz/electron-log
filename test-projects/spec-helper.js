'use strict';

const fs   = require('fs');
const path = require('path');
const exec = require('child_process').exec;

module.exports = {
  runApplication(appName) {
    return new Promise((resolve, reject) => {
      const app = exec(
        'npm start -- --test',
        { cwd: path.join(__dirname, appName) },
        (error) => error ? reject(error) : resolve()
      );

      app.stdout.pipe(process.stdout);
      app.stderr.pipe(process.stderr);
    });
  },

  readLog(appName) {
    const logPath = path.join(getLogPath(appName), 'log.log');
    return new Promise((resolve, reject) => {
      fs.readFile(logPath, 'utf8', (error, data) => {
        if (error) return reject(error);
        resolve(data.split('\n'));
      });
    });
  },

  removeLogDir(appName) {
    const logDir = getLogPath(appName);
    if (!logDir) {
      return Promise.reject('Could not get log path');
    }

    return new Promise((resolve, reject) => {
      const cmd = process.platform === 'win32' ? 'rd /s /q' : 'rm -r';
      exec(`${cmd} ${logDir}`, (error, stdout, stderr) => {
        if (error) {
          console.warn(error.message);
        }
        resolve();
      });
    });
  },

  run(appName) {
    let logs;
    return Promise.resolve()
      .then(() => this.removeLogDir(appName))
      .then(() => this.runApplication(appName))
      .then(() => this.readLog(appName))
      .then(lines => logs = lines)
      .then(() => this.removeLogDir(appName))
      .then(() => logs);
  }
};

function getLogPath(appName) {
  if (!appName) return false;

  const home = process.env.HOME;

  switch(process.platform) {
    case 'linux': {
      if (!home) return false;
      return `${home}/.config/${appName}`;
    }

    case 'darwin': {
      if (!home) return false;
      return `${home}/Library/Logs/${appName}`;
    }

    default: {
      if (!process.env.APPDATA) return false;
      return `${process.env.APPDATA}\\${appName}`;
    }
  }
}
