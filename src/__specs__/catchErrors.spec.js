'use strict';

var catchErrors = require('../catchErrors');

describe('catchErrors', function () {
  beforeAll(function () {
    this.originalListeners = process.listeners('unhandledRejection');
    process.removeAllListeners('unhandledRejection');
  });

  afterAll(function () {
    this.originalListeners.forEach(function (listener) {
      process.addListener('unhandledRejection', listener);
    });
  });

  afterEach(function () {
    this.catcher && this.catcher.stop();
  });

  it('should pass an error to options.log callback', function (done) {
    this.catcher = catchErrors({ log: log });

    Promise.reject(new Error('test-error'));

    function log(_, e) {
      expect(e.message).toBe('test-error');
      done();
    }
  }, 50);

  it('should pass an error to options.onError callback', function (done) {
    this.catcher = catchErrors({ onError: onError });

    Promise.reject(new Error('test-error'));

    function onError(e) {
      expect(e.message).toBe('test-error');
      done();
      return false;
    }
  }, 50);
});
