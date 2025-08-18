'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const preloadInitializeFn = require('../renderer/electron-log-preload');

let preloadInitialized = false;
let spyConsoleInitialized = false;

module.exports = {
  initialize({
    externalApi,
    getSessions,
    includeFutureSession,
    logger,
    preload = true,
    spyRendererConsole = false,
  }) {
    externalApi.onAppReady(() => {
      try {
        if (preload) {
          initializePreload({
            externalApi,
            getSessions,
            includeFutureSession,
            logger,
            preloadOption: preload,
          });
        }

        if (spyRendererConsole) {
          initializeSpyRendererConsole({ externalApi, logger });
        }
      } catch (err) {
        logger.warn(err);
      }
    });
  },
};

function initializePreload({
  externalApi,
  getSessions,
  includeFutureSession,
  logger,
  preloadOption,
}) {
  let preloadPath = typeof preloadOption === 'string'
    ? preloadOption
    : undefined;

  if (preloadInitialized) {
    logger.warn(new Error('log.initialize({ preload }) already called').stack);
    return;
  }

  preloadInitialized = true;

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
      externalApi.getAppUserDataPath() || os.tmpdir(),
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

  externalApi.setPreloadFileForSessions({
    filePath: preloadPath,
    includeFutureSession,
    getSessions,
  });
}

function initializeSpyRendererConsole({ externalApi, logger }) {
  if (spyConsoleInitialized) {
    logger.warn(
      new Error('log.initialize({ spyRendererConsole }) already called').stack,
    );
    return;
  }

  spyConsoleInitialized = true;

  const levels = ['debug', 'info', 'warn', 'error'];
  externalApi.onEveryWebContentsEvent(
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
