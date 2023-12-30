'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const electronApi = require('./electronApi');
const preloadInitializeFn = require('../renderer/electron-log-preload');

module.exports = {
  initialize({
    getSessions,
    includeFutureSession,
    logger,
    preload = true,
    spyRendererConsole = false,
  }) {
    electronApi.onAppReady(() => {
      try {
        if (preload) {
          initializePreload({
            getSessions,
            includeFutureSession,
            preloadOption: preload,
          });
        }

        if (spyRendererConsole) {
          initializeSpyRendererConsole({ logger });
        }
      } catch (err) {
        logger.warn(err);
      }
    });
  },
};

function initializePreload({
  getSessions,
  includeFutureSession,
  preloadOption,
}) {
  let preloadPath = typeof preloadOption === 'string'
    ? preloadOption
    : undefined;

  try {
    preloadPath = path.resolve(
      __dirname,
      '../renderer/electron-log-preload.js',
    );
  } catch {
    // Ignore, the file is bundled to ESM
  }

  if (!preloadPath || !fs.existsSync(preloadPath)) {
    preloadPath = path.join(
      electronApi.getAppUserDataPath() || os.tmpdir(),
      'electron-log-preload.js',
    );
    const preloadCode = `
      try {
        (${preloadInitializeFn.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
    fs.writeFileSync(preloadPath, preloadCode, 'utf8');
  }

  electronApi.setPreloadFileForSessions({
    filePath: preloadPath,
    includeFutureSession,
    getSessions,
  });
}

function initializeSpyRendererConsole({ logger }) {
  const levels = ['verbose', 'info', 'warning', 'error'];
  electronApi.onEveryWebContentsEvent(
    'console-message',
    (event, level, message) => {
      logger.processMessage({
        data: [message],
        level: levels[level],
        variables: { processType: 'renderer' },
      });
    },
  );
}
