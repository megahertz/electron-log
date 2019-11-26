'use strict';

var object = require('../object');

describe('transform/object', function () {
  it('maxDepthFactory', function () {
    var obj = [{ a: { b: {} } }];
    expect(object.maxDepthFactory(3)(obj))
      .toEqual([{ a: { b: '[object]' } }]);
  });

  describe('serialize', function () {
    it('should serialize object', function () {
      expect(object.serialize(null, { a: 1 })).toEqual({ a: 1 });
    });

    it('should serialize errors', function () {
      expect(object.serialize(null, new Error('test')))
        .toEqual({
          constructor: 'Error',
          stack: jasmine.stringMatching('Error: test'),
        });
    });

    it('should serialize functions', function () {
      expect(object.serialize(null, function () { return 1 }))
        .toEqual('[function] function () { return 1 }');
    });
  });
});
