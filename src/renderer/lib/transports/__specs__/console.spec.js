'use strict';

const consoleTransportFactory = require('../console');

describe(consoleTransportFactory.name, () => {
  const formatDataFn = consoleTransportFactory({}).transforms[0];

  describe(formatDataFn.name, () => {
    describe('when text in the end of format', () => {
      const transport = {
        format: '{text}',
      };

      it('should keep unchanged string with color', () => {
        const data = formatDataFn({
          transport,
          data: ['%c red text', 'color: red'],
        });

        expect(data).toEqual(['%c red text', 'color: red']);
      });

      it('should keep placeholders', () => {
        const data = formatDataFn({
          transport,
          data: ['a is %d', 1],
        });

        expect(data).toEqual(['a is %d', 1]);
      });

      it('should keep colors and placeholder', () => {
        const data = formatDataFn({
          transport,
          data: ['a is %d, %c b is red', 1, 'color: red'],
        });

        expect(data).toEqual(['a is %d, %c b is red', 1, 'color: red']);
      });
    });

    it('should concatenate printf-like templates', () => {
      expect(formatDataFn({ data: ['%d', 1], transport: { format: '{text}' } }))
        .toEqual(['%d', 1]);
      expect(formatDataFn({ data: ['d', 1], transport: { format: '{text}' } }))
        .toEqual(['', 'd', 1]);
    });

    it('should support level', () => {
      expect(formatDataFn({
        transport: { format: '{level}' },
        message: { level: 'info' },
      }))
        .toEqual(['info']);
    });

    it('should support scope', () => {
      expect(formatDataFn({
        transport: { format: '{scope}' },
        message: { scope: 'test' },
      })).toEqual(['(test)']);
    });

    describe('format time', () => {
      it('normal', () => {
        const data = formatDataFn({
          transport: { format: '{y}.{m}.{d} {h}:{i}:{s}.{ms}' },
          message: { date: new Date('2000-12-01T03:00:00.000') },
        });
        expect(data).toEqual(['2000.12.01 03:00:00.000']);
      });

      it('iso', () => {
        const data = formatDataFn({
          transport: { format: '{iso}' },
          message: { date: new Date('2000-12-01T03:00:00.000Z') },
        });
        expect(data).toEqual(['2000-12-01T03:00:00.000Z']);
      });
    });
  });
});
