'use strict';

var template = require('../template');

describe('transform/template', function () {
  var message = {
    level: 'info',
    data: ['test'],
    date: new Date(2000, 0, 1, 1, 1, 1),
    variables: { myVar: 'myVarValue' },
  };

  describe('formatDate', function () {
    var date = new Date(2000, 0, 1, 1, 1, 1);

    it('should transform regular template', function () {
      expect(template.formatDate('{y}-{m}-{d} {h}:{i}:{s}.{ms}', date))
        .toBe('2000-01-01 01:01:01.000');
    });

    it('should transform utc date', function () {
      expect(template.formatDate('{iso}', date))
        .toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.000Z$/);
    });
  });

  it('formatTimeZone', function () {
    expect(template.formatTimeZone(-60)).toBe('+01:00');
    expect(template.formatTimeZone(60)).toBe('-01:00');
    expect(template.formatTimeZone(-570)).toBe('+09:30');
  });

  it('pad', function () {
    expect(template.pad(1, 1)).toBe('1');
    expect(template.pad(1)).toBe('01');
    expect(template.pad(10, 3)).toBe('010');
  });

  it('templateDate', function () {
    expect(template.templateDate(['{h}:{i}:{s}', 1], message))
      .toEqual(['01:01:01', 1]);
  });

  it('templateVariables', function () {
    expect(template.templateVariables(['{myVar}s', 1], message))
      .toEqual(['myVarValues', 1]);
  });

  describe('templateText', function () {
    it('should remove template if it`s the latest variable', function () {
      expect(template.templateText(['log: {text}', 1], message))
        .toEqual(['log:', 1]);
    });

    it('should stringify all if it`s not the latest variable', function () {
      expect(template.templateText(['{text} log', 1], message))
        .toEqual([1, ' log']);
    });
  });
});
