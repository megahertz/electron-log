'use strict';

const consoleTransportFactory = require('../console');
const Logger = require('../../../core/Logger');

describe('Console transport', () => {
  describe('with default template', () => {
    it('prints "test" with styles enabled', () => {
      const [text] = transformMessage(['test'], {
        format: consoleTransportFactory.DEFAULT_FORMAT,
        useStyles: true,
      });
      expect(text).toMatch(
        // eslint-disable-next-line no-control-regex
        /^\x1b\[36m\d\d:\d\d:\d\d.\d\d\d\x1b\[0m .\x1b\[0m test$/,
      );
    });
  });

  describe('when text in the end of format', () => {
    it('should transform string with color', () => {
      const data = transformMessage(['%c red text', 'color: red']);
      expect(data).toEqual([' red text']);
    });

    it('should transform string with placeholder', () => {
      const data = transformMessage(['a is %d', 1]);
      expect(data).toEqual(['a is %d', 1]);
    });

    it('should transform string with color and placeholder', () => {
      const data = transformMessage([
        'a is %d, %c b is red',
        1,
        'color: red',
      ]);
      expect(data).toEqual(['a is %d,  b is red', 1]);
    });
  });

  describe('when text in the end of format, colored', () => {
    it('should transform string with color', () => {
      const data = transformMessage(['%c red text', 'color: red'], {
        useStyles: true,
      });

      expect(data).toEqual(['\x1b[31m red text\x1b[0m']);
    });

    it('should transform string with placeholder', () => {
      const data = transformMessage(['a is %d', 1], { useStyles: true });
      expect(data).toEqual(['a is %d', 1]);
    });

    it('should transform string with color and placeholder', () => {
      const data = transformMessage(
        ['a is %d, %c b is red', 1, 'color: red'],
        { useStyles: true },
      );
      expect(data).toEqual(['a is %d, \x1b[31m b is red\x1b[0m', 1]);
    });
  });

  describe('when text in the beginning of format', () => {
    it('should transform string with color', () => {
      const data = transformMessage(
        ['%c red text', 'color: red'],
        { format: '{text}.' },
      );
      expect(data).toEqual([' red text .']);
    });

    it('should transform string with placeholder', () => {
      const data = transformMessage(['a is %d', 1], { format: '{text}.' });
      expect(data).toEqual(['a is %d', 1, '.']);
    });

    it('should transform string with color and placeholder', () => {
      const data = transformMessage(
        ['a is %d, %c b is red', 1, 'color: red'],
        { format: '{text}.' },
      );

      expect(data).toEqual(['a is %d,  b is red', 1, '.']);
    });
  });
});

function transformMessage(data, consoleOptions = {}) {
  const log = new Logger({
    transportFactories: {
      console: consoleTransportFactory,
    },
  });

  let transformed = [];

  Object.assign(log.transports.console, {
    format: '{text}',
    useStyles: false,
    ...consoleOptions,
    writeFn({ message }) {
      transformed = message.data;
    },
  });

  log.info(...data);

  return transformed;
}
