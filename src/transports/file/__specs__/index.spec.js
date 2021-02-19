'use strict';

var os = require('os');
var path = require('path');
var TestLogReader = require('../../../__specs__/utils/TestLogReader');
var FileRegistry = require('../file').FileRegistry;
var fileTransportFactory = require('../index');
var makeTmpDir = require('./makeTmpDir');

describe('File transport', function () {
  var TEST_MESSAGE = createMessage('test');
  var TEST_MESSAGE_SIZE = 38 + os.EOL.length;

  afterEach(function () {
    TestLogReader.removeDefaultLogDir('humile');
  });

  it('should create a file on first write', function () {
    var transport = createTransport();

    transport(TEST_MESSAGE);

    expect(TestLogReader.fromApp('humile').format()).toEqual([
      'main.log: test',
    ]);
  });

  it('should archive an old log', function () {
    var transport = createTransport();
    transport.maxSize = 20;

    transport(TEST_MESSAGE);
    expect(TestLogReader.fromApp('humile').format()).toEqual([
      'main.log: test',
    ]);

    transport(createMessage('test2'));
    expect(TestLogReader.fromApp('humile').format().sort()).toEqual([
      'main.log: test2',
      'main.old.log: test',
    ]);
  });

  it('should allow to change file location', function () {
    var tmpDir = makeTmpDir(false);

    try {
      var logFilePath = path.join(tmpDir.path, 'mylog.txt');
      var transport = createTransport({
        resolvePath: function () { return logFilePath },
      });

      transport(TEST_MESSAGE);

      expect(TestLogReader.fromFile(logFilePath).format()).toEqual([
        'mylog.txt: test',
      ]);
    } finally {
      tmpDir.remove();
    }
  });

  it('should provide access to the current file', function () {
    var transport = createTransport();

    transport(TEST_MESSAGE);
    var file = transport.getFile();

    expect(file.bytesWritten).toEqual(TEST_MESSAGE_SIZE);
    expect(file.size).toEqual(TEST_MESSAGE_SIZE);
    expect(file.path).toMatch('main.log');
  });

  it('should create a file if the path is UNC', function () {
    if (process.platform !== 'win32') {
      return;
    }

    var transport = createTransport({
      resolvePath: function (vars) {
        return '\\\\?\\' + path.join(vars.libraryDefaultDir, vars.fileName);
      },
    });

    transport(TEST_MESSAGE);

    expect(TestLogReader.fromApp('humile').format()).toEqual([
      'main.log: test',
    ]);
  });

  describe('should provide deprecated members until v5: ', function () {
    beforeAll(function () {
      this.noDeprecationBackup = process.noDeprecation;
      process.noDeprecation = true;
    });

    afterAll(function () {
      process.noDeprecation = this.noDeprecationBackup;
    });

    it('file', function () {
      var transport = createTransport();
      var defaultPath = TestLogReader.getDefaultLogDir('humile');

      expect(transport.file).toEqual(
        path.join(defaultPath, 'main.log')
      );

      transport.file = path.join(defaultPath, 'changed.log');

      transport(TEST_MESSAGE);

      expect(TestLogReader.fromApp('humile').format()).toEqual([
        'changed.log: test',
      ]);
    });

    it('fileSize', function () {
      var transport = createTransport();

      transport(TEST_MESSAGE);

      expect(transport.fileSize).toBe(TEST_MESSAGE_SIZE);
    });

    it('bytesWritten', function () {
      var transport = createTransport();

      transport(TEST_MESSAGE);

      expect(transport.bytesWritten).toBe(TEST_MESSAGE_SIZE);
    });

    it('clear()', function () {
      var transport = createTransport();

      transport(TEST_MESSAGE);

      transport.clear();

      expect(transport.bytesWritten).toBe(0);
      expect(TestLogReader.fromApp('humile').format()).toEqual([]);
    });

    it('findLogPath()', function () {
      var transport = createTransport();
      var defaultPath = TestLogReader.getDefaultLogDir('humile');

      expect(transport.findLogPath()).toEqual(
        path.join(defaultPath, 'main.log')
      );
    });

    it('init()', function () {
      var transport = createTransport();

      // just do nothing
      expect(transport.init()).toBe(undefined);
    });
  });
});

function createTransport(options) {
  var electronLog = {
    scope: {
      getOptions: function () { return {} },
    },
    transports: {
      // eslint-disable-next-line no-console
      console: console.log,
    },
  };
  var transport = fileTransportFactory(electronLog, new FileRegistry());

  Object.assign(transport, options || {});

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
