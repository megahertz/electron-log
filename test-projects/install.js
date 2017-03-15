'use strict';

const path = require('path');
const exec = require('child_process').exec;

Promise.resolve()
  .then(() => installPackage('electron-log-test-node'))
  .then(() => installPackage('electron-log-test-nwjs'))
  .then(() => installPackage('electron-log-test-simple'))
  .then(() => installPackage('electron-log-test-webpack'))
  .catch(e => console.error(e));

function installPackage(name) {
  return new Promise((resolve, reject) => {
    exec(
      'npm install',
      { cwd: path.join(__dirname, name) },
      (error, stdout, stderr) => {
        error ? reject(error) : resolve();
        console.log(stdout + stderr);
      }
    );
  });
}