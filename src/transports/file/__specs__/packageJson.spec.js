'use strict';

var path = require('path');
var packageJsonSpec = require('../packageJson');

describe('transports/file/packageJson', function () {
  describe('tryReadJsonAt', function () {
    it('should resolve data when child path specified', function () {
      var json = packageJsonSpec.tryReadJsonAt(__filename);

      expect(json.name).toBe('electron-log');
      expect(json.version).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should resolve data when root specified', function () {
      var rootPath = path.join(__dirname, '../../../..');
      var json = packageJsonSpec.tryReadJsonAt(rootPath);

      expect(json.name).toBe('electron-log');
      expect(json.version).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should return null on fail', function () {
      var json = packageJsonSpec.tryReadJsonAt('/');

      expect(json).toBe(null);
    });
  });
});
