'use strict';

const ipcTransportFactory = require('../ipc');

describe(ipcTransportFactory.name, () => {
  const serializeFn = ipcTransportFactory({}).transforms[0];
  describe(serializeFn.name, () => {
    it('should stringify functions', () => {
      const data = { fn: () => {} };
      expect(serializeFn({ data })).toEqual({
        fn: '() => {}',
      });
    });

    it('should skip Promises, WeakMaps, WeakSets', () => {
      const data = {
        promise: Promise.resolve(),
        weakMap: new WeakMap(),
        weakSet: new WeakSet(),
      };

      expect(serializeFn({ data })).toEqual({
        promise: '[Promise]',
        weakMap: '[WeakMap]',
        weakSet: '[WeakSet]',
      });
    });

    it('should keep cycle references', () => {
      const data = { prop: {} };
      data.prop.self = data;

      const serialized = serializeFn({ data });

      expect(serialized === serialized.prop.self);
    });

    it('should iterate objects', () => {
      const data = { object: { wm: new WeakMap() } };
      expect(serializeFn({ data })).toEqual({
        object: { wm: '[WeakMap]' },
      });
    });

    it('should iterate arrays', () => {
      const data = { array: [new WeakMap()] };
      expect(serializeFn({ data })).toEqual({
        array: ['[WeakMap]'],
      });
    });

    it('should iterate sets', () => {
      const data = { set: new Set([new WeakMap()]) };
      expect(serializeFn({ data })).toEqual({
        set: new Set(['[WeakMap]']),
      });
    });

    it('should iterate maps', () => {
      const data = { map: new Map([[new WeakMap(), new WeakSet()]]) };
      expect(serializeFn({ data }))
        .toEqual({ map: new Map([['[WeakMap]', '[WeakSet]']]) });
    });
  });
});
