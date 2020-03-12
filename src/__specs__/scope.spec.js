'use strict';

var scopeFactory = require('../scope');

describe('scope', function () {
  it('should store maximum label length', function () {
    var electronLog = mockElectronLog();
    var scope = scopeFactory(electronLog);

    scope('test');
    expect(scope.maxLabelLength).toBe(4);

    scope('test2');
    expect(scope.maxLabelLength).toBe(5);
  });

  describe('labelLength', function () {
    it('when labelPadding is true', function () {
      var electronLog = mockElectronLog();
      var scope = scopeFactory(electronLog);
      scope.labelPadding = true;

      expect(scope.getOptions().labelLength).toBe(0);

      scope('test');
      expect(scope.getOptions().labelLength).toBe(4);
    });

    it('when labelPadding is false', function () {
      var electronLog = mockElectronLog();
      var scope = scopeFactory(electronLog);
      scope.labelPadding = false;

      expect(scope.getOptions().labelLength).toBe(0);

      scope('test');
      expect(scope.getOptions().labelLength).toBe(0);
    });

    it('when labelPadding is number', function () {
      var electronLog = mockElectronLog();
      var scope = scopeFactory(electronLog);
      scope.labelPadding = 10;

      expect(scope.getOptions().labelLength).toBe(10);

      scope('test');
      expect(scope.getOptions().labelLength).toBe(10);
    });
  });
});

function mockElectronLog() {
  return {
    levels: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
  };
}
