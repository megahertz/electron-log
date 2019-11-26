'use strict';

var index = require('../index');

describe('transform', function () {
  var message = {
    level: 'info',
    data: ['test'],
    date: new Date(2000, 0, 1, 1, 1, 1),
    variables: { myVar: 'myVarValue' },
  };

  describe('customFormatterFactory', function () {
    it('should transform with string template', function () {
      var formatter = index.customFormatterFactory('{h}:{i}:{s} › {text}');

      expect(formatter(['test'], message))
        .toEqual(['01:01:01 ›', 'test']);
    });

    it('should transform with callback', function () {
      var formatter = index.customFormatterFactory(function (msg) {
        return msg.data;
      });

      expect(formatter(['test'], message))
        .toEqual(['test']);
    });
  });

  it('transform', function () {
    var transformed = index.transform(message, [
      function (d) { return d.concat(1) },
    ]);

    expect(transformed).toEqual(['test', 1]);
  });
});
