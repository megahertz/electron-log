'use strict';

const format = require('../format');

describe('transform/format', () => {
  const message = {
    level: 'info',
    logId: 'default',
    data: ['test'],
    date: new Date('2000-01-01T01:01:01.000'),
    scope: 'test',
    variables: { myVar: 'myVarValue' },
  };

  describe('format', () => {
    it('should transform with string template', () => {
      const data = format.format({
        transport: { format: '{h}:{i}:{s} › {text}' },
        message,
      });
      expect(data).toEqual(['01:01:01 ›', 'test']);
    });

    it('should transform with callback', () => {
      const data = format.format({
        transport: { format: (args) => args.data },
        message,
      });

      expect(data).toEqual(['test']);
    });
  });

  describe('concatFirstStringElements', () => {
    it('when has no printf-like template', () => {
      expect(format.concatFirstStringElements({ data: ['one', 'two'] }))
        .toEqual(['one two']);
    });

    it('when has printf-like template', () => {
      expect(format.concatFirstStringElements({ data: ['val: %d', 2] }))
        .toEqual(['val: %d', 2]);
    });
  });

  describe('formatScope', () => {
    it('should set scope with padding', () => {
      const data = format.formatScope({
        data: ['{scope}', 1],
        logger: { scope: { labelLength: 6 } },
        message,
      });

      expect(data).toEqual([' (test)  ', 1]);
    });

    it('should set empty scope if defaultLabel is false', () => {
      const data = format.formatScope({
        data: ['{scope}', 1],
        logger: {
          scope: { labelLength: 6, defaultLabel: false },
        },
        message: { ...message, scope: undefined },
      });

      expect(data).toEqual(['', 1]);
    });

    it('should add blank padding if defaultLabel is empty string', () => {
      const data = format.formatScope({
        data: ['{scope}', 1],
        logger: {
          scope: {
            labelLength: 6,
            defaultLabel: '',
          },
        },
        message: { ...message, scope: undefined },
      });

      expect(data).toEqual(['         ', 1]);
    });
  });

  describe('formatText', () => {
    it('should remove template if it`s the latest variable', () => {
      expect(format.formatText({ data: ['log: {text}', 1] }))
        .toEqual(['log:', 1]);
    });

    it('should stringify all if it`s not the latest variable', () => {
      expect(format.formatText({ data: ['{text} log', 1] }))
        .toEqual([1, ' log']);
    });
  });

  describe('formatVariables', () => {
    describe('date', () => {
      it('should replace {y}-{m}-{d} date', () => {
        const data = format.formatVariables({
          data: ['{y}-{m}-{d} {h}:{i}:{s}.{ms}'],
          message,
        });
        expect(data).toEqual(['2000-01-01 01:01:01.000']);
      });

      it('should replace date iso', () => {
        const data = format.formatVariables({ data: ['{iso}'], message });
        expect(data[0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.000Z$/);
      });
    });

    describe('level', () => {
      it('should replace just a level template', () => {
        expect(format.formatVariables({ data: ['{level}'], message }))
          .toEqual(['info']);
      });

      it('should replace level with align', () => {
        expect(format.formatVariables({ data: ['[{level}]~'], message }))
          .toEqual(['[info] ~']);
      });
    });

    it('should replace logId', () => {
      expect(format.formatVariables({ data: ['{logId}'], message }))
        .toEqual(['default']);
    });

    it('should replace custom variables', () => {
      expect(format.formatVariables({ data: ['{myVar}s', 1], message }))
        .toEqual(['myVarValues', 1]);
    });
  });

  it('timeZoneFromOffset', () => {
    expect(format.timeZoneFromOffset(-60)).toBe('+01:00');
    expect(format.timeZoneFromOffset(60)).toBe('-01:00');
    expect(format.timeZoneFromOffset(-570)).toBe('+09:30');
  });
});
