'use strict';

const humilePkg = require('humile/package.json');
const os = require('os');
const path = require('path');
const NodeExternalApi = require('../NodeExternalApi');

describe(NodeExternalApi.constructor.name, () => {
  describe(NodeExternalApi.prototype.getSystemPathAppData.name, () => {
    it('on Linux', () => {
      expect(api('linux').getSystemPathAppData()).toBe(
        path.join(os.homedir(), '.config'),
      );
    });

    it('on macOS', () => {
      expect(api('darwin').getSystemPathAppData()).toBe(
        path.join(os.homedir(), 'Library/Application Support'),
      );
    });

    it('on Windows', () => {
      expect(api('win32').getSystemPathAppData()).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming'),
      );
    });
  });

  it(NodeExternalApi.prototype.getAppName.name, () => {
    expect(api().getAppName()).toBe('humile');
  });

  it(NodeExternalApi.prototype.getAppVersion.name, () => {
    expect(api().getAppVersion()).toBe(humilePkg.version);
  });

  describe(NodeExternalApi.prototype.getPathVariables.name, () => {
    it('on Linux', () => {
      const appData = path.join(os.homedir(), '.config');

      expect(api('linux').getPathVariables()).toEqual({
        appData,
        appName: 'humile',
        appVersion: humilePkg.version,
        electronDefaultDir: path.join(appData, 'humile/logs'),
        home: os.homedir(),
        libraryDefaultDir: path.join(appData, 'humile/logs'),
        libraryTemplate: path.join(appData, '{appName}/logs'),
        temp: os.tmpdir(),
        userData: path.join(appData, 'humile'),
      });
    });

    it('on macOS', () => {
      const appData = path.join(os.homedir(), 'Library/Application Support');

      expect(api('darwin').getPathVariables()).toEqual({
        appData,
        appName: 'humile',
        appVersion: humilePkg.version,
        electronDefaultDir: path.join(os.homedir(), 'Library/Logs/humile'),
        home: os.homedir(),
        libraryDefaultDir: path.join(os.homedir(), 'Library/Logs/humile'),
        libraryTemplate: path.join(os.homedir(), 'Library/Logs/{appName}'),
        temp: os.tmpdir(),
        userData: path.join(appData, 'humile'),
      });
    });

    it('on Windows', () => {
      const appData = path.join(os.homedir(), 'AppData', 'Roaming');

      expect(api('win32').getPathVariables()).toEqual({
        appData,
        appName: 'humile',
        appVersion: humilePkg.version,
        electronDefaultDir: path.join(appData, 'humile', 'logs'),
        home: os.homedir(),
        libraryDefaultDir: path.join(appData, 'humile', 'logs'),
        libraryTemplate: path.join(appData, '{appName}/logs'),
        temp: os.tmpdir(),
        userData: path.join(appData, 'humile'),
      });
    });
  });

  /**
   * @param {NodeJS.Platform} platform
   * @returns {NodeExternalApi}
   */
  function api(platform = process.platform) {
    const externalApi = new NodeExternalApi();
    externalApi.setPlatform(platform);
    return externalApi;
  }
});
