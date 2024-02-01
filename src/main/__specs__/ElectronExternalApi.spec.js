'use strict';

const humilePkg = require('humile/package.json');
const ElectronExternalApi = require('../ElectronExternalApi');

describe('ElectronExternalApi', () => {
  describe('getAppName', () => {
    it('gets the electron app name property', () => {
      const electron = {
        app: {
          name: 'test-prop',
          getName: () => 'test-func',
        },
      };

      expect(api({ electron }).getAppName()).toBe('test-prop');
    });

    it('calls the electron app name function when no name property', () => {
      const electron = {
        app: {
          name: undefined,
          getName: () => 'test-func',
        },
      };

      expect(api({ electron }).getAppName()).toBe('test-func');
    });

    it('fallsback to super function when no electron names', () => {
      const electron = {
        app: {
          name: undefined,
          getName: undefined,
        },
      };

      expect(api({ electron }).getAppName()).toBe(humilePkg.name);
    });

    it('fallsback to super function when no electron', () => {
      const electron = undefined;

      expect(api({ electron }).getAppName()).toBe(humilePkg.name);
    });
  });

  /**
   * @param {object} options
   * @param {NodeJS.Platform} options.platform
   * @param {typeof Electron} options.electron
   * @returns {ElectronExternalApi}
   */
  function api({ electron, platform = process.platform } = {}) {
    const externalApi = new ElectronExternalApi({ electron });
    externalApi.setPlatform(platform);
    return externalApi;
  }
});
