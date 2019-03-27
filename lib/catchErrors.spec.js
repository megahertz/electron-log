'use strict';

var expect      = require('chai').expect;
var catchErrors = require('./catchErrors');

describe('catchErrors', function () {
  afterEach(function () {
    this.catcher && this.catcher.stop();
  });

  it('should pass an error to options.log callback', function (done) {
    this.timeout(50);

    this.catcher = catchErrors({ log: log });

    Promise.reject(new Error('test-error'));

    function log(e) {
      expect(e.message).to.equal('test-error');
      done();
    }
  });

  it('should pass an error to options.onError callback', function (done) {
    this.timeout(50);

    this.catcher = catchErrors({ onError: onError });

    Promise.reject(new Error('test-error'));

    function onError(e) {
      expect(e.message).to.equal('test-error');
      done();
      return false;
    }
  });
});
