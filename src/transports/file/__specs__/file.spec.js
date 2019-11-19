'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var file = require('../file');
var makeTmpDir = require('./makeTmpDir');

describe('transports/file/file', function () {
  describe('File', function () {
    var LICENSE_PATH = path.join(__dirname, '../../../../LICENSE');
    var LICENSE_FILE_SIZE = 1082;

    afterEach(function () {
      makeTmpDir(false).remove();
    });

    describe('getSize', function () {
      it('should return size of an existed file', function () {
        var testFile = new file.File(LICENSE_PATH);

        expect(testFile.size).toBe(LICENSE_FILE_SIZE);
      });

      it('should return size of an existed file + written bytes', function () {
        var testFile = new file.File(LICENSE_PATH);
        testFile.bytesWritten = 1;

        expect(testFile.size).toBe(LICENSE_FILE_SIZE + 1);
      });
    });

    it('reset', function () {
      var testFile = new file.File(LICENSE_PATH);

      testFile.initialSize = 0;
      testFile.bytesWritten = 1;
      testFile.reset();

      expect(testFile.size).toBe(LICENSE_FILE_SIZE);
    });

    describe('clear', function () {
      it('should remove file if exists', function () {
        var tmpDir = makeTmpDir();
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        testFile.writeLine('test');

        expect(testFile.clear()).toBe(true);

        expect(fs.existsSync(testFile.path)).toBe(false);
      });

      it('should do nothing when no file exists', function () {
        var tmpDir = makeTmpDir();
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        expect(testFile.clear()).toBe(true);

        expect(fs.existsSync(testFile.path)).toBe(false);
      });
    });

    describe('writeLine', function () {
      it('should write text to the file', function () {
        var tmpDir = makeTmpDir();
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        testFile.writeLine('test');

        expect(fs.readFileSync(testFile.path, 'utf8')).toBe('test' + os.EOL);
      });

      it('should increase bytesWritten', function () {
        var tmpDir = makeTmpDir();
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        testFile.writeLine('test');

        expect(testFile.bytesWritten).toBe(4 + os.EOL.length);
      });

      it('should emit error if dir not exists', function (done) {
        var tmpDir = makeTmpDir(false);
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        testFile.on('error', function (error) {
          expect(error.message).toMatch('Couldn\'t write to ');
          done();
        });

        testFile.writeLine('test');
      });
    });
  });

  describe('NullFile', function () {
    it('should not perform file operations', function () {
      var nullFile = new file.NullFile('/not-exists/1.txt');

      nullFile.writeLine('test');
      expect(nullFile.size).toBe(0);
    });
  });

  describe('FileRegistry', function () {
    afterEach(function () {
      makeTmpDir(false).remove();
    });

    describe('provide', function () {
      it('should create a new file if the path is correct', function () {
        var tmpDir = makeTmpDir();
        var registry = new file.FileRegistry();
        var testFile = registry.provide(path.join(tmpDir.path, 'log.txt'));

        expect(testFile.isNull()).toBe(false);
        expect(fs.existsSync(testFile.path)).toBe(true);
      });

      it('should return the same instance on second call', function () {
        var tmpDir = makeTmpDir();
        var registry = new file.FileRegistry();
        var filePath = path.join(tmpDir.path, 'log.txt');
        var testFile = registry.provide(filePath);

        expect(testFile.isNull()).toBe(false);
        expect(testFile).toBe(registry.provide(filePath));
      });

      it('should return null file when cannot resolve path', function (done) {
        var registry = new file.FileRegistry();

        registry.on('error', function (e) {
          expect(e.message).toMatch('argument must be of type string');
          done();
        });

        var testFile = registry.provide(null);

        expect(testFile.isNull()).toBe(true);
      });
    });
  });
});
