'use strict';

const scopeFactory = require('../scope');

describe('scope', () => {
  it('should store maximum label length', () => {
    const logger = mockLogger();
    const scope = scopeFactory(logger);

    scope('test');
    expect(scope.maxLabelLength).toBe(4);

    scope('test2');
    expect(scope.maxLabelLength).toBe(5);
  });

  describe('labelLength', () => {
    it('when labelPadding is true', () => {
      const logger = mockLogger();
      const scope = scopeFactory(logger);
      scope.labelPadding = true;

      expect(scope.labelLength).toBe(0);

      scope('test');
      expect(scope.labelLength).toBe(4);
    });

    it('when labelPadding is false', () => {
      const logger = mockLogger();
      const scope = scopeFactory(logger);
      scope.labelPadding = false;

      expect(scope.labelLength).toBe(0);

      scope('test');
      expect(scope.labelLength).toBe(0);
    });

    it('when labelPadding is a number', () => {
      const logger = mockLogger();
      const scope = scopeFactory(logger);
      scope.labelPadding = 10;

      expect(scope.labelLength).toBe(10);

      scope('test');
      expect(scope.labelLength).toBe(10);
    });
  });
});

function mockLogger() {
  return {
    levels: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
  };
}
