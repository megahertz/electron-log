'use strict';

const os = require('os');
const path = require('path');
const electronApi = require('../../electronApi');
const packageJson = require('./packageJson');

module.exports = {
  getAppData,
  getLibraryDefaultDir,
  getLibraryTemplate,
  getNameAndVersion,
  getPathVariables,
  getUserData,
};

function getAppData(platform) {
  const appData = electronApi.getPath('appData');
  if (appData) {
    return appData;
  }

  const home = getHome();

  switch (platform) {
    case 'darwin': {
      return path.join(home, 'Library/Application Support');
    }

    case 'win32': {
      return process.env.APPDATA || path.join(home, 'AppData/Roaming');
    }

    default: {
      return process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    }
  }
}

function getHome() {
  return os.homedir ? os.homedir() : process.env.HOME;
}

function getLibraryDefaultDir(platform, appName) {
  if (platform === 'darwin') {
    return path.join(getHome(), 'Library/Logs', appName);
  }

  return path.join(getUserData(platform, appName), 'logs');
}

function getLibraryTemplate(platform) {
  if (platform === 'darwin') {
    return path.join(getHome(), 'Library/Logs', '{appName}');
  }

  return path.join(getAppData(platform), '{appName}', 'logs');
}

function getNameAndVersion() {
  let name = electronApi.getName() || '';
  let version = electronApi.getVersion();

  if (name.toLowerCase() === 'electron') {
    name = '';
    version = '';
  }

  if (name && version) {
    return { name, version };
  }

  const packageValues = packageJson.readPackageJson();
  if (!name) {
    name = packageValues.name;
  }

  if (!version) {
    version = packageValues.version;
  }

  if (!name) {
    // Fallback, otherwise file transport can't be initialized
    name = 'Electron';
  }

  return { name, version };
}

/**
 * @param {string} platform
 * @return {PathVariables}
 */
function getPathVariables(platform) {
  const nameAndVersion = getNameAndVersion();
  const appName = nameAndVersion.name;
  const appVersion = nameAndVersion.version;

  return {
    appData: getAppData(platform),
    appName,
    appVersion,
    get electronDefaultDir() {
      return electronApi.getPath('logs');
    },
    home: getHome(),
    libraryDefaultDir: getLibraryDefaultDir(platform, appName),
    libraryTemplate: getLibraryTemplate(platform),
    temp: electronApi.getPath('temp') || os.tmpdir(),
    userData: getUserData(platform, appName),
  };
}

function getUserData(platform, appName) {
  if (electronApi.getName() !== appName) {
    return path.join(getAppData(platform), appName);
  }

  return electronApi.getPath('userData')
    || path.join(getAppData(platform), appName);
}
