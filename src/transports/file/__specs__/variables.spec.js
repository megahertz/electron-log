'use strict';

const humilePkg = require('humile/package.json');
const os = require('os');
const path = require('path');
const variables = require('../variables');

describe('transports/file/variables', () => {
  describe('getAppData', () => {
    it('on Linux', () => {
      expect(variables.getAppData('linux')).toBe(
        path.join(os.homedir(), '.config'),
      );
    });

    it('on macOS', () => {
      expect(variables.getAppData('darwin')).toBe(
        path.join(os.homedir(), 'Library/Application Support'),
      );
    });

    it('on Windows', () => {
      expect(variables.getAppData('win32')).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming'),
      );
    });
  });

  describe('getLibraryDefaultDir', () => {
    it('on Linux', () => {
      expect(variables.getLibraryDefaultDir('linux', 'electron-log')).toBe(
        path.join(os.homedir(), '.config/electron-log/logs'),
      );
    });

    it('on macOS', () => {
      expect(variables.getLibraryDefaultDir('darwin', 'electron-log')).toBe(
        path.join(os.homedir(), 'Library/Logs/electron-log'),
      );
    });

    it('on Windows', () => {
      expect(variables.getLibraryDefaultDir('win32', 'electron-log')).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming', 'electron-log', 'logs'),
      );
    });
  });

  describe('getLibraryTemplate', () => {
    it('on Linux', () => {
      expect(variables.getLibraryTemplate('linux')).toBe(
        path.join(os.homedir(), '.config/{appName}/logs'),
      );
    });

    it('on macOS', () => {
      expect(variables.getLibraryTemplate('darwin')).toBe(
        path.join(os.homedir(), 'Library/Logs/{appName}'),
      );
    });

    it('on Windows', () => {
      expect(variables.getLibraryTemplate('win32')).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming', '{appName}', 'logs'),
      );
    });
  });

  it('getNameAndVersion', () => {
    const nameAndVersion = variables.getNameAndVersion();

    expect(nameAndVersion.name).toBe('humile');
    expect(nameAndVersion.version).toMatch(/\d+\.\d+\.\d+/);
  });

  describe('getPathVariables', () => {
    it('on Linux', () => {
      const appData = path.join(os.homedir(), '.config');

      expect(variables.getPathVariables('linux')).toEqual({
        appData,
        appName: 'humile',
        appVersion: humilePkg.version,
        electronDefaultDir: null, // test runned not in electron
        home: os.homedir(),
        libraryDefaultDir: path.join(appData, 'humile/logs'),
        libraryTemplate: path.join(appData, '{appName}/logs'),
        temp: os.tmpdir(),
        userData: path.join(appData, 'humile'),
      });
    });

    it('on macOS', () => {
      const appData = path.join(os.homedir(), 'Library/Application Support');

      expect(variables.getPathVariables('darwin')).toEqual({
        appData,
        appName: 'humile',
        appVersion: humilePkg.version,
        electronDefaultDir: null, // test runned not in electron
        home: os.homedir(),
        libraryDefaultDir: path.join(os.homedir(), 'Library/Logs/humile'),
        libraryTemplate: path.join(os.homedir(), 'Library/Logs/{appName}'),
        temp: os.tmpdir(),
        userData: path.join(appData, 'humile'),
      });
    });

    it('on Windows', () => {
      const appData = path.join(os.homedir(), 'AppData', 'Roaming');

      expect(variables.getPathVariables('win32')).toEqual({
        appData,
        appName: 'humile',
        appVersion: humilePkg.version,
        electronDefaultDir: null, // test runned not in electron
        home: os.homedir(),
        libraryDefaultDir: path.join(appData, 'humile', 'logs'),
        libraryTemplate: path.join(appData, '{appName}/logs'),
        temp: os.tmpdir(),
        userData: path.join(appData, 'humile'),
      });
    });
  });

  describe('getUserData', () => {
    it('on Linux', () => {
      expect(variables.getUserData('linux', 'electron-log')).toBe(
        path.join(os.homedir(), '.config/electron-log'),
      );
    });

    it('on macOS', () => {
      expect(variables.getUserData('darwin', 'electron-log')).toBe(
        path.join(os.homedir(), 'Library/Application Support/electron-log'),
      );
    });

    it('on Windows', () => {
      expect(variables.getUserData('win32', 'electron-log')).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming', 'electron-log'),
      );
    });
  });
});
