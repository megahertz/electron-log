'use strict';

const style = require('../style');

describe('transform/style', () => {
  it('applyAnsiStyles', () => {
    const data = style.applyAnsiStyles({
      data: ['%c 1 %c 2', 'color:red', 'color:green'],
    });

    expect(data)
      .toEqual(['\x1b[31m 1 \x1b[32m 2\x1b[0m']);
  });

  it('removeStyles', () => {
    const data = style.removeStyles({
      data: ['%c 1 %c 2', 'color:red', 'color:green'],
    });

    expect(data)
      .toEqual([' 1  2']);
  });

  describe('transformStyles', () => {
    function onStyleFound(s) {
      return `${s}: `;
    }

    it('simple data', () => {
      expect(style.transformStyles(['%c1 %c2', 'a', 'b'], onStyleFound))
        .toEqual(['a: 1 b: 2']);
    });

    it('missed styles', () => {
      expect(style.transformStyles(['%c1 %c2'], onStyleFound))
        .toEqual(['%c1 %c2']);
    });

    it('complex data', () => {
      function onStyleApplied(str) {
        return `${str} end`;
      }

      const data = ['%c1 %c2', 'a', '%c3', '%c4', 'b'];

      expect(style.transformStyles(data, onStyleFound, onStyleApplied))
        .toEqual(['a: 1 %c3: 2 end', 'b: 4 end']);
    });
  });
});
