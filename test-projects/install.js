'use strict';

const path = require('path');
const exec = require('child_process').exec;

Promise.resolve()
  .then(() => install('electron-log-test-node'))
  .then(() => install('electron-log-test-nwjs'))
  .then(() => install('electron-log-test-simple'))
  .then(() => install('electron-log-test-webpack'))
  .catch(e => console.error(e));

function install(name) {
  return clearNodeModules(name)
    .then(() => installPackage(name));
}

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

function clearNodeModules(name) {
  return new Promise((resolve) => {
    exec(
      'rm -rf node_modules',
      { cwd: path.join(__dirname, name) },
      (error, stdout, stderr) => {
        resolve();
        console.log(stdout + stderr);
      }
    );
  });
}
