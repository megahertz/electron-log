'use strict';

const { maxDepth, serialize, toJSON, toString } = require('../object');

describe('transform/object', () => {
  describe('maxDepth', () => {
    it('should remove objects nested deeper than depth', () => {
      const data = [{ a: { b: {} } }];
      expect(maxDepth({ data, depth: 3 })).toEqual([{ a: { b: '[object]' } }]);
    });

    it('should correctly process null values', () => {
      const data = [{ a: null, b: undefined, c: { c1: null } }, null];
      expect(maxDepth({ data }))
        .toEqual([{ a: null, b: undefined, c: { c1: null } }, null]);
    });
  });

  describe('serialize', () => {
    it('should serialize object', () => {
      expect(serialize(null, { a: 1 })).toEqual({ a: 1 });
    });

    it('should serialize errors', () => {
      expect(serialize(null, new Error('test'))).toMatch('Error: test\n');
    });

    it('should serialize functions', () => {
      expect(serialize(null, () => 1)).toEqual('[function] () => 1');
    });

    it('should serialize set', () => {
      expect(serialize(null, new Set([1]))).toEqual([1]);
    });

    it('should serialize map', () => {
      if (Object.fromEntries) {
        expect(serialize(null, new Map([['a', 1]]))).toEqual({ a: 1 });
      }
    });
  });

  describe('toJson', () => {
    it('should prevent circular reference exception', () => {
      const data = { a: 1 };
      data.b = data;
      const safeObj = maxDepth({ data });

      expect(() => { toJSON({ data: safeObj }) }).not.toThrow();
    });
  });

  describe('toString', () => {
    it('should not throw when stringify undefined value', () => {
      const error = new Error();
      delete error.stack;

      expect(() => { toString({ data: [error] }) }).not.toThrow();
    });

    it('should convert a set to a string representation', () => {
      const set = new Set([1]);
      expect(toString({ data: [set] })).toEqual('[ 1 ]');
    });
  });
});
