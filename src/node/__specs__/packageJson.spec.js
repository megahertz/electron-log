'use strict';

const path = require('path');
const { tryReadJsonAt } = require('../packageJson');

describe('node/packageJson', () => {
  describe(tryReadJsonAt.name, () => {
    it('should resolve data when child path specified', () => {
      const json = tryReadJsonAt(__filename);

      expect(json.name).toBe('electron-log');
      expect(json.version).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should resolve data when root specified', () => {
      const rootPath = path.join(__dirname, '../..');
      const json = tryReadJsonAt(rootPath);

      expect(json.name).toBe('electron-log');
      expect(json.version).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should return null on fail', () => {
      const json = tryReadJsonAt('/');

      expect(json).toBe(undefined);
    });
  });
});
