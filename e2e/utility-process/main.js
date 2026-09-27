'use strict';

const { app, utilityProcess } = require('electron');
const path = require('node:path');
const log = require('../../main');

log.initialize();
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] '
  + '{processType}{scope} {text}';

log.info('log from the main process');

app.on('ready', () => {
  const child = utilityProcess.fork(path.join(__dirname, 'utility.js'));

  /* eslint-disable no-underscore-dangle */
  child.on('message', (payload) => {
    if (payload?.__electronLog) {
      log.processMessage(payload.__electronLog);
    }

    if (payload === 'done') {
      app.quit();
    }
  });
  /* eslint-enable no-underscore-dangle */
});
