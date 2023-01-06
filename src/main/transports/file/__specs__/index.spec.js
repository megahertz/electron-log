'use strict';

const os = require('os');
const path = require('path');
const TestLogReader = require('../../../../__specs__/utils/TestLogReader');
const FileRegistry = require('../FileRegistry');
const fileTransportFactory = require('../index');
const makeTmpDir = require('./makeTmpDir');
const Logger = require('../../../../core/Logger');

describe('File transport', () => {
  const TEST_MESSAGE = createMessage('test');
  const TEST_MESSAGE_SIZE = 38 + os.EOL.length;

  afterEach(() => {
    TestLogReader.removeDefaultLogDir('humile');
  });

  it('should create a file on first write', () => {
    const transport = createTransport();

    transport(TEST_MESSAGE);

    expect(TestLogReader.fromApp('humile').format()).toEqual(['test']);
  });

  it('should archive an old log', () => {
    const transport = createTransport();
    transport.maxSize = 20;

    transport(TEST_MESSAGE);
    expect(TestLogReader.fromApp('humile').format()).toEqual(['test']);

    transport(createMessage('test2'));
    expect(TestLogReader.fromApp('humile').format('{fileName}: {text}').sort())
      .toEqual(['main.log: test2', 'main.old.log: test']);
  });

  it('should allow to change file location', () => {
    const tmpDir = makeTmpDir(false);
    const logFilePath = path.join(tmpDir.path, 'mylog.txt');

    try {
      const transport = createTransport({
        resolvePathFn() { return logFilePath },
      });

      transport(TEST_MESSAGE);

      expect(TestLogReader.fromFile(logFilePath).format('{fileName}: {text}'))
        .toEqual(['mylog.txt: test']);
    } finally {
      tmpDir.remove();
    }
  });

  it('should provide access to the current file', () => {
    const transport = createTransport();

    transport(TEST_MESSAGE);
    const file = transport.getFile();

    expect(file.bytesWritten).toEqual(TEST_MESSAGE_SIZE);
    expect(file.size).toEqual(TEST_MESSAGE_SIZE);
    expect(file.path).toMatch('main.log');
  });

  it('should create a file if the path is UNC', () => {
    if (process.platform !== 'win32') {
      return;
    }

    const transport = createTransport({
      resolvePathFn(vars) {
        return `\\\\?\\${path.join(vars.libraryDefaultDir, vars.fileName)}`;
      },
    });

    transport(TEST_MESSAGE);

    expect(TestLogReader.fromApp('humile').format()).toEqual(['test']);
  });
});

function createTransport(options = {}) {
  const logger = new Logger({
    transportFactories: {
      // eslint-disable-next-line no-console
      console: () => console.log,
    },
  });
  const transport = fileTransportFactory(logger, new FileRegistry());

  Object.assign(transport, options);

  return transport;
}

function createMessage(data, level) {
  return {
    data: Array.isArray(data) ? data : [data],
    date: new Date(),
    level: level || 'info',
    variables: {},
  };
}
