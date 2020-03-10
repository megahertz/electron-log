'use strict';

var transport = require('../console');

describe('Console transport', function () {
  describe('transformRenderer', function () {
    describe('when text in the end of format', function () {
      var transportCfg = {
        format: '{text}',
      };

      it('should transform string with color', function () {
        var msg = createMessage(['%c red text', 'color: red']);

        var transformed = transport.transformRenderer(msg, transportCfg);

        expect(transformed).toEqual(['%c red text', 'color: red']);
      });

      it('should transform string with placeholder', function () {
        var msg = createMessage(['a is %d', 1]);

        var transformed = transport.transformRenderer(msg, transportCfg);

        expect(transformed).toEqual(['a is %d', 1]);
      });

      it('should transform string with color and placeholder', function () {
        var msg = createMessage(['a is %d, %c b is red', 1, 'color: red']);

        var transformed = transport.transformRenderer(msg, transportCfg);

        expect(transformed).toEqual(['a is %d, %c b is red', 1, 'color: red']);
      });
    });

    describe('when text in the beginning of format', function () {
      var transportCfg = {
        format: '{text}.',
      };

      it('should transform string with color', function () {
        var msg = createMessage(['%c red text', 'color: red']);

        var transformed = transport.transformRenderer(msg, transportCfg);

        expect(transformed).toEqual(['%c red text', 'color: red', '.']);
      });

      it('should transform string with placeholder', function () {
        var msg = createMessage(['a is %d', 1]);

        var transformed = transport.transformRenderer(msg, transportCfg);

        expect(transformed).toEqual(['a is %d', 1, '.']);
      });

      it('should transform string with color and placeholder', function () {
        var msg = createMessage(['a is %d, %c b is red', 1, 'color: red']);

        var transformed = transport.transformRenderer(msg, transportCfg);

        expect(transformed).toEqual([
          'a is %d, %c b is red',
          1,
          'color: red',
          '.',
        ]);
      });
    });
  });

  describe('transformMain', function () {
    describe('when text in the end of format', function () {
      var transportCfg = {
        format: '{text}',
        useStyles: false,
      };

      it('should transform string with color', function () {
        var msg = createMessage(['%c red text', 'color: red']);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual([' red text']);
      });

      it('should transform string with placeholder', function () {
        var msg = createMessage(['a is %d', 1]);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual(['a is %d', 1]);
      });

      it('should transform string with color and placeholder', function () {
        var msg = createMessage(['a is %d, %c b is red', 1, 'color: red']);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual(['a is %d,  b is red', 1]);
      });
    });

    describe('when text in the end of format, colored', function () {
      var transportCfg = {
        format: '{text}',
        useStyles: true,
      };

      it('should transform string with color', function () {
        var msg = createMessage(['%c red text', 'color: red']);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual(['\x1b[31m red text\x1b[0m']);
      });

      it('should transform string with placeholder', function () {
        var msg = createMessage(['a is %d', 1]);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual(['a is %d', 1]);
      });

      it('should transform string with color and placeholder', function () {
        var msg = createMessage(['a is %d, %c b is red', 1, 'color: red']);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual(['a is %d, \x1b[31m b is red\x1b[0m', 1]);
      });
    });

    describe('when text in the beginning of format', function () {
      var transportCfg = {
        format: '{text}.',
        useStyles: false,
      };

      it('should transform string with color', function () {
        var msg = createMessage(['%c red text', 'color: red']);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual([' red text .']);
      });

      it('should transform string with placeholder', function () {
        var msg = createMessage(['a is %d', 1]);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual(['a is %d', 1, '.']);
      });

      it('should transform string with color and placeholder', function () {
        var msg = createMessage(['a is %d, %c b is red', 1, 'color: red']);

        var transformed = transport.transformMain(msg, transportCfg);

        expect(transformed).toEqual([
          'a is %d,  b is red',
          1,
          '.',
        ]);
      });
    });
  });
});

function createMessage(data) {
  return {
    data: data,
    date: new Date(),
  };
}
