'use strict';

const log = require('..');

describe('index', () => {
  describe('serialize', () => {
    const serialize = log.transports.ipc.serializeFn;

    it('should stringify functions', () => {
      const obj = { fn: () => {} };
      expect(serialize(obj)).toEqual({
        fn: '() => {}',
      });
    });

    it('should skip Promises, WeakMaps, WeakSets', () => {
      const obj = {
        promise: Promise.resolve(),
        weakMap: new WeakMap(),
        weakSet: new WeakSet(),
      };

      expect(serialize(obj)).toEqual({
        promise: '[Promise]',
        weakMap: '[WeakMap]',
        weakSet: '[WeakSet]',
      });
    });

    it('should keep cycle references', () => {
      const obj = { prop: {} };
      obj.prop.self = obj;

      const serialized = serialize(obj);

      expect(serialized === serialized.prop.self);
    });

    it('should iterate objects', () => {
      expect(serialize({ object: { wm: new WeakMap() } })).toEqual({
        object: { wm: '[WeakMap]' },
      });
    });

    it('should iterate arrays', () => {
      expect(serialize({ array: [new WeakMap()] })).toEqual({
        array: ['[WeakMap]'],
      });
    });

    it('should iterate sets', () => {
      expect(serialize({ set: new Set([new WeakMap()]) })).toEqual({
        set: new Set(['[WeakMap]']),
      });
    });

    it('should iterate maps', () => {
      expect(serialize({ map: new Map([[new WeakMap(), new WeakSet()]]) }))
        .toEqual({ map: new Map([['[WeakMap]', '[WeakSet]']]) });
    });
  });

  describe('formatDataFn', () => {
    const formatDataFn = log.transports.console.formatDataFn;

    describe('when text in the end of format', () => {
      it('should keep unchanged string with color', () => {
        const data = formatDataFn({
          format: '{text}',
          data: ['%c red text', 'color: red'],
        });

        expect(data).toEqual(['%c red text', 'color: red']);
      });

      it('should keep placeholders', () => {
        const data = formatDataFn({
          format: '{text}',
          data: ['a is %d', 1],
        });

        expect(data).toEqual(['a is %d', 1]);
      });

      it('should keep colors and placeholder', () => {
        const data = formatDataFn({
          format: '{text}',
          data: ['a is %d, %c b is red', 1, 'color: red'],
        });

        expect(data).toEqual(['a is %d, %c b is red', 1, 'color: red']);
      });
    });

    it('should concatenate printf-like templates', () => {
      expect(formatDataFn({ data: ['%d', 1], format: '{text}' }))
        .toEqual(['%d', 1]);
      expect(formatDataFn({ data: ['d', 1], format: '{text}' }))
        .toEqual(['', 'd', 1]);
    });

    it('should support level', () => {
      expect(formatDataFn({ format: '{level}', level: 'info' }))
        .toEqual(['info']);
    });

    it('should support scope', () => {
      expect(formatDataFn({ format: '{scope}', scope: 'test' }))
        .toEqual(['(test)']);
    });

    describe('format time', () => {
      it('normal', () => {
        const data = formatDataFn({
          format: '{y}.{m}.{d} {h}:{i}:{s}.{ms}',
          date: new Date('2000-12-01T03:00:00.000'),
        });
        expect(data).toEqual(['2000.12.01 03:00:00.000']);
      });

      it('iso', () => {
        const data = formatDataFn({
          format: '{iso}',
          date: new Date('2000-12-01T03:00:00.000Z'),
        });
        expect(data).toEqual(['2000-12-01T03:00:00.000Z']);
      });
    });
  });
});
