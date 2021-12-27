'use strict';

var object = require('../object');

describe('transform/object', function () {
  describe('maxDepthFactory', function () {
    it('should remove objects nested deeper than depth', function () {
      var obj = [{ a: { b: {} } }];
      expect(object.maxDepthFactory(3)(obj))
        .toEqual([{ a: { b: '[object]' } }]);
    });

    it('should correctly process null values', function () {
      var obj = [{ a: null, b: undefined, c: { c1: null } }, null];
      expect(object.maxDepthFactory()(obj))
        .toEqual([{ a: null, b: undefined, c: { c1: null } }, null]);
    });
  });

  describe('serialize', function () {
    it('should serialize object', function () {
      expect(object.serialize(null, { a: 1 })).toEqual({ a: 1 });
    });

    it('should serialize errors', function () {
      expect(object.serialize(null, new Error('test')))
        .toMatch('Error: test\n');
    });

    it('should serialize functions', function () {
      expect(object.serialize(null, function () { return 1 }))
        .toEqual('[function] function () { return 1 }');
    });

    it('should serialize set', function () {
      expect(object.serialize(null, new Set([1]))).toEqual([1]);
    });

    it('should serialize map', function () {
      if (Object.fromEntries) {
        expect(object.serialize(null, new Map([['a', 1]]))).toEqual({ a: 1 });
      }
    });
  });

  describe('toJson', function () {
    it('should prevent circular reference exception', function () {
      var obj = { a: 1 };
      obj.b = obj;
      var safeObj = object.maxDepthFactory()(obj);

      expect(function () { object.toJSON(safeObj) }).not.toThrow();
    });
  });

  describe('toString', function () {
    it('should not throw when stringify undefined value', function () {
      var error = new Error();
      delete error.stack;

      expect(function () { object.toStringFactory()([error]) }).not.toThrow();
    });

    it('should convert a set to a string representation', function () {
      var set = new Set([1]);
      expect(object.toStringFactory()([set])).toEqual('[ 1 ]');
    });
  });
});
