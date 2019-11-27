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
      it('should remove file when exists', function () {
        var tmpDir = makeTmpDir();
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        testFile.writeLine('test');

        expect(testFile.clear()).toBe(true);

        expect(fs.statSync(testFile.path).size).toBe(0);
      });

      it('should create an empty file when no file exists', function () {
        var tmpDir = makeTmpDir();
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        expect(testFile.clear()).toBe(true);

        expect(fs.statSync(testFile.path).size).toBe(0);
      });
    });

    describe('crop', function () {
      it('should crop when file contains more than bytesAfter', function () {
        var tmpDir = makeTmpDir();
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        testFile.writeLine('1'.repeat(4096));
        testFile.crop(7 + os.EOL.length);

        expect(fs.readFileSync(testFile.path, 'utf8'))
          .toEqual('[log cropped]' + os.EOL + '1111111' + os.EOL + os.EOL);
      });

      it('should crop when file contains less than bytesAfter', function () {
        var tmpDir = makeTmpDir();
        var testFile = new file.File(path.join(tmpDir.path, 'test.txt'));

        testFile.writeLine('1'.repeat(4));
        testFile.crop(8);

        expect(fs.readFileSync(testFile.path, 'utf8'))
          .toEqual('[log cropped]' + os.EOL + '1111' + os.EOL + os.EOL);
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
          expect(e.message).toMatch('string');
          done();
        });

        var testFile = registry.provide(null);

        expect(testFile.isNull()).toBe(true);
      });
    });
  });
});
