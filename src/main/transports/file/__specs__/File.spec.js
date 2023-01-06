'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const File = require('../File');
const makeTmpDir = require('./makeTmpDir');

describe('File', () => {
  const LICENSE_PATH = path.join(__dirname, '../../../../../LICENSE');
  const LICENSE_FILE_SIZE = 1082;

  afterEach(() => {
    makeTmpDir(false).remove();
  });

  describe('getSize', () => {
    it('should return size of an existed file', () => {
      const testFile = new File({ path: LICENSE_PATH });

      expect(testFile.size).toBe(LICENSE_FILE_SIZE);
    });

    it('should return size of an existed file + written bytes', () => {
      const testFile = new File({ path: LICENSE_PATH });
      testFile.bytesWritten = 1;

      expect(testFile.size).toBe(LICENSE_FILE_SIZE + 1);
    });
  });

  it('reset', () => {
    const testFile = new File({ path: LICENSE_PATH });

    testFile.initialSize = 0;
    testFile.bytesWritten = 1;
    testFile.reset();

    expect(testFile.size).toBe(LICENSE_FILE_SIZE);
  });

  describe('clear', () => {
    it('should remove file when exists', () => {
      const tmpDir = makeTmpDir();
      const testFile = new File({ path: path.join(tmpDir.path, 'test.txt') });

      testFile.writeLine('test');

      expect(testFile.clear()).toBe(true);

      expect(fs.statSync(testFile.path).size).toBe(0);
    });

    it('should create an empty file when no file exists', () => {
      const tmpDir = makeTmpDir();
      const testFile = new File({ path: path.join(tmpDir.path, 'test.txt') });

      expect(testFile.clear()).toBe(true);

      expect(fs.statSync(testFile.path).size).toBe(0);
    });
  });

  describe('crop', () => {
    it('should crop when file contains more than bytesAfter', () => {
      const tmpDir = makeTmpDir();
      const testFile = new File({ path: path.join(tmpDir.path, 'test.txt') });

      testFile.writeLine('1'.repeat(4096));
      testFile.crop(7 + os.EOL.length);

      expect(fs.readFileSync(testFile.path, 'utf8'))
        .toEqual(`[log cropped]${os.EOL}1111111${os.EOL}${os.EOL}`);
    });

    it('should crop when file contains less than bytesAfter', () => {
      const tmpDir = makeTmpDir();
      const testFile = new File({ path: path.join(tmpDir.path, 'test.txt') });

      testFile.writeLine('1'.repeat(4));
      testFile.crop(8);

      expect(fs.readFileSync(testFile.path, 'utf8'))
        .toEqual(`[log cropped]${os.EOL}1111${os.EOL}${os.EOL}`);
    });
  });

  describe('writeLine', () => {
    it('should write text to the file', () => {
      const tmpDir = makeTmpDir();
      const testFile = new File({ path: path.join(tmpDir.path, 'test.txt') });

      testFile.writeLine('test');

      expect(fs.readFileSync(testFile.path, 'utf8')).toBe(`test${os.EOL}`);
    });

    it('should increase bytesWritten', () => {
      const tmpDir = makeTmpDir();
      const testFile = new File({ path: path.join(tmpDir.path, 'test.txt') });

      testFile.writeLine('test');

      expect(testFile.bytesWritten).toBe(4 + os.EOL.length);
    });

    it('should emit error if dir not exists', (done) => {
      const tmpDir = makeTmpDir(false);
      const testFile = new File({ path: path.join(tmpDir.path, 'test.txt') });

      testFile.on('error', (error) => {
        expect(error.message).toMatch('Couldn\'t write to ');
        done();
      });

      testFile.writeLine('test');
    });
  });
});
