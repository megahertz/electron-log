'use strict';

/**
 * Some ideas from sindresorhus/electron-unhandled
 */

var utils = require('./utils');

var isAttached = false;

module.exports = function catchErrors(options) {
  if (isAttached) return;
  isAttached = true;

  if (process.type === 'renderer') {
    window.addEventListener('error', onRendererError);
    window.addEventListener('unhandledrejection', onRendererRejection);
  } else {
    process.on('uncaughtException', onError);
    process.on('unhandledRejection', onRejection);
  }

  function onError(e) {
    try {
      if (typeof options.onError === 'function') {
        if (options.onError(e) === false) {
          return;
        }
      }

      options.log(e);

      if (options.showDialog && e.name.indexOf('UnhandledRejection') < 0) {
        var type = process.type || 'main';
        utils.showErrorBox(
          'A JavaScript error occurred in the ' + type + ' process',
          e.stack
        );
      }
    } catch (logError) {
      console.error(e);
    }
  }

  function onRejection(reason) {
    if (reason instanceof Error) {
      reason.name = 'UnhandledRejection ' + reason.name;
      onError(reason);
      return;
    }

    var error = new Error(JSON.stringify(reason));
    error.name = 'UnhandledRejection';
    onError(error);
  }

  function onRendererError(event) {
    event.preventDefault();
    onError(event.error);
  }

  function onRendererRejection(event) {
    event.preventDefault();
    onRejection(event.reason);
  }
};
