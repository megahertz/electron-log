'use strict';

const path = require('path');
const packageJsonSpec = require('../packageJson');

describe('transports/file/packageJson', () => {
  describe('tryReadJsonAt', () => {
    it('should resolve data when child path specified', () => {
      const json = packageJsonSpec.tryReadJsonAt(__filename);

      expect(json.name).toBe('electron-log');
      expect(json.version).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should resolve data when root specified', () => {
      const rootPath = path.join(__dirname, '../../../..');
      const json = packageJsonSpec.tryReadJsonAt(rootPath);

      expect(json.name).toBe('electron-log');
      expect(json.version).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should return null on fail', () => {
      const json = packageJsonSpec.tryReadJsonAt('/');

      expect(json).toBe(null);
    });
  });
});
