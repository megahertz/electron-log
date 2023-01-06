'use strict';

const fs = require('fs');
const path = require('path');
const electronApi = require('./electronApi');

module.exports = {
  initialize({ logger, preload = true, spyRendererConsole = false }) {
    if (preload && spyRendererConsole) {
      throw new Error('Either preload or spyRendererConsole should be set');
    }

    electronApi.whenAppReady()
      .then(() => {
        if (preload) {
          initializePreload(preload);
        }

        if (spyRendererConsole) {
          initializeSpyRendererConsole(logger);
        }
      })
      .catch(logger.warn);
  },
};

function initializePreload(preloadOption) {
  const preloadPath = typeof preloadOption === 'string'
    ? preloadOption
    : path.resolve(__dirname, '../renderer/preload.js');

  if (!fs.existsSync(preloadPath)) {
    throw new Error(`Preload file ${preloadPath} doesn't exist`);
  }

  electronApi.setPreloadFileForSessions({ filePath: preloadPath });
}

function initializeSpyRendererConsole(logger) {
  const levels = ['verbose', 'info', 'warning', 'error'];
  electronApi.onEveryWebContentsEvent(
    'console-message',
    (event, level, message) => {
      logger.processMessage({ data: [message], level: levels[level] });
    },
  );
}
