'use strict';

const fs = require('fs');
const path = require('path');
const FileRegistry = require('../FileRegistry');
const makeTmpDir = require('./makeTmpDir');

describe('FileRegistry', () => {
  afterEach(() => {
    makeTmpDir(false).remove();
  });

  describe('provide', () => {
    it('should create a new file if the path is correct', () => {
      const tmpDir = makeTmpDir();
      const registry = new FileRegistry();
      const testFile = registry.provide({
        filePath: path.join(tmpDir.path, 'log.txt'),
      });

      expect(testFile.isNull()).toBe(false);
      expect(fs.existsSync(testFile.path)).toBe(true);
    });

    it('should return the same instance on second call', () => {
      const tmpDir = makeTmpDir();
      const registry = new FileRegistry();
      const filePath = path.join(tmpDir.path, 'log.txt');
      const testFile = registry.provide({ filePath });

      expect(testFile.isNull()).toBe(false);
      expect(testFile).toBe(registry.provide({ filePath }));
    });

    it('should return null file when cannot resolve path', (done) => {
      const registry = new FileRegistry();

      registry.on('error', (e) => {
        expect(e.message).toMatch('string');
        done();
      });

      const testFile = registry.provide({ filePath: null });

      expect(testFile.isNull()).toBe(true);
    });
  });
});
