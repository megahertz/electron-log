'use strict';

const ErrorHandler = require('../ErrorHandler');

describe('ErrorHandler', () => {
  beforeAll(function () {
    this.originalListeners = process.listeners('unhandledRejection');
    process.removeAllListeners('unhandledRejection');
  });

  afterAll(function () {
    this.originalListeners.forEach((listener) => {
      process.addListener('unhandledRejection', listener);
    });
  });

  afterEach(function () {
    this.errorHandler?.stopCatching();
  });

  it('should pass an error to options.log callback', function (done) {
    this.errorHandler = new ErrorHandler({ logFn: log });
    this.errorHandler.startCatching();

    Promise.reject(new Error('test-error'));

    function log(_, e) {
      expect(e.message).toBe('test-error');
      done();
    }
  }, 50);

  it('should pass an error to options.onError callback', function (done) {
    this.errorHandler = new ErrorHandler({ onError });
    this.errorHandler.startCatching();

    Promise.reject(new Error('test-error'));

    function onError({ error }) {
      expect(error.message).toBe('test-error');
      done();
      return false;
    }
  }, 50);
});
