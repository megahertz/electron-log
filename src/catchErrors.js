'use strict';

/**
 * Some ideas from sindresorhus/electron-unhandled
 */

var electronApi = require('./electronApi');

var isAttached = false;

module.exports = function catchErrors(options) {
  if (isAttached) return { stop: stop };
  isAttached = true;

  if (process.type === 'renderer') {
    window.addEventListener('error', onRendererError);
    window.addEventListener('unhandledrejection', onRendererRejection);
  } else {
    process.on('uncaughtException', onError);
    process.on('unhandledRejection', onRejection);
  }

  return { stop: stop };

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
        electronApi.showErrorBox(
          'A JavaScript error occurred in the ' + type + ' process',
          e.stack
        );
      }
    } catch (logError) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  function onRejection(reason) {
    if (reason instanceof Error) {
      var reasonName = 'UnhandledRejection ' + reason.name;

      var errPrototype = Object.getPrototypeOf(reason);
      var nameProperty = Object.getOwnPropertyDescriptor(errPrototype, 'name');
      if (!nameProperty || !nameProperty.writable) {
        reason = new Error(reason.message);
      }

      reason.name = reasonName;
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

  function stop() {
    isAttached = false;

    if (process.type === 'renderer') {
      window.removeEventListener('error', onRendererError);
      window.removeEventListener('unhandledrejection', onRendererRejection);
    } else {
      process.removeListener('uncaughtException', onError);
      process.removeListener('unhandledRejection', onRejection);
    }
  }
};
