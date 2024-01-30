'use strict';

const humilePkg = require('humile/package.json');
const ElectronExternalApi = require('../ElectronExternalApi');

describe('ElectronExternalApi', () => {
  /**
   * This test must mock the `electron` module because when
   * requiring the module then its properties are undefined.
   * This makes it difficult to test our API methods otherwise.
   *
   * @type {Electron}
   */
  let mockElectron;

  beforeEach(() => {
    mockElectron = undefined;
  });

  describe('getAppName', () => {
    it('gets the electron app name property', () => {
      mockElectron = {
        app: {
          name: 'test-prop',
          getName: () => 'test-func',
        },
      };

      expect(api().getAppName()).toBe('test-prop');
    });

    it('calls the electron app name function when no name property', () => {
      mockElectron = {
        app: {
          name: undefined,
          getName: () => 'test-func',
        },
      };

      expect(api().getAppName()).toBe('test-func');
    });

    it('fallsback to super function when no electron names', () => {
      mockElectron = {
        app: {
          name: undefined,
          getName: undefined,
        },
      };

      expect(api().getAppName()).toBe(humilePkg.name);
    });

    it('fallsback to super function when no electron', () => {
      mockElectron = undefined;

      expect(api().getAppName()).toBe(humilePkg.name);
    });
  });

  /**
   * @param {object} options
   * @param {NodeJS.Platform} options.platform
   * @param {Electron} options.electron
   * @returns {ElectronExternalApi}
   */
  function api({ platform = process.platform, electron = mockElectron } = {}) {
    const externalApi = new ElectronExternalApi({ electron });
    externalApi.setPlatform(platform);
    return externalApi;
  }
});
