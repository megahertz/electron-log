'use strict';

var humilePkg = require('humile/package.json');
var os = require('os');
var path = require('path');
var variables = require('../variables');

describe('transports/file/variables', function () {
  describe('getAppData', function () {
    it('on Linux', function () {
      expect(variables.getAppData('linux')).toBe(
        path.join(os.homedir(), '.config')
      );
    });

    it('on macOS', function () {
      expect(variables.getAppData('darwin')).toBe(
        path.join(os.homedir(), 'Library/Application Support')
      );
    });

    it('on Windows', function () {
      expect(variables.getAppData('win32')).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming')
      );
    });
  });

  describe('getLibraryDefaultDir', function () {
    it('on Linux', function () {
      expect(variables.getLibraryDefaultDir('linux', 'electron-log')).toBe(
        path.join(os.homedir(), '.config/electron-log/logs')
      );
    });

    it('on macOS', function () {
      expect(variables.getLibraryDefaultDir('darwin', 'electron-log')).toBe(
        path.join(os.homedir(), 'Library/Logs/electron-log')
      );
    });

    it('on Windows', function () {
      expect(variables.getLibraryDefaultDir('win32', 'electron-log')).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming', 'electron-log', 'logs')
      );
    });
  });

  describe('getLibraryTemplate', function () {
    it('on Linux', function () {
      expect(variables.getLibraryTemplate('linux')).toBe(
        path.join(os.homedir(), '.config/{appName}/logs')
      );
    });

    it('on macOS', function () {
      expect(variables.getLibraryTemplate('darwin')).toBe(
        path.join(os.homedir(), 'Library/Logs/{appName}')
      );
    });

    it('on Windows', function () {
      expect(variables.getLibraryTemplate('win32')).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming', '{appName}', 'logs')
      );
    });
  });

  it('getNameAndVersion', function () {
    var nameAndVersion = variables.getNameAndVersion();

    expect(nameAndVersion.name).toBe('humile');
    expect(nameAndVersion.version).toMatch(/\d+\.\d+\.\d+/);
  });

  describe('getPathVariables', function () {
    it('on Linux', function () {
      var appData = path.join(os.homedir(), '.config');

      expect(variables.getPathVariables('linux')).toEqual({
        appData: appData,
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

    it('on macOS', function () {
      var appData = path.join(os.homedir(), 'Library/Application Support');

      expect(variables.getPathVariables('darwin')).toEqual({
        appData: appData,
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

    it('on Windows', function () {
      var appData = path.join(os.homedir(), 'AppData', 'Roaming');

      expect(variables.getPathVariables('win32')).toEqual({
        appData: appData,
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

  describe('getUserData', function () {
    it('on Linux', function () {
      expect(variables.getUserData('linux', 'electron-log')).toBe(
        path.join(os.homedir(), '.config/electron-log')
      );
    });

    it('on macOS', function () {
      expect(variables.getUserData('darwin', 'electron-log')).toBe(
        path.join(os.homedir(), 'Library/Application Support/electron-log')
      );
    });

    it('on Windows', function () {
      expect(variables.getUserData('win32', 'electron-log')).toBe(
        path.join(os.homedir(), 'AppData', 'Roaming', 'electron-log')
      );
    });
  });
});
