'use strict';

var fs          = require('fs');
var os          = require('os');
var path        = require('path');
var findLogPath = require('../findLogPath');

module.exports = {
  getExpectedLogPath: getExpectedLogPath
};

describe('findLogPath', function () {
  afterEach(function () {
    try {
      fs.unlinkSync(getExpectedLogPath('el-test'));
    } catch (e) {
      // Just skip, after some test file doesn't exist
    }
  });

  it('should return valid path depending on OS', function () {
    expect(findLogPath('el-test')).toBe(getExpectedLogPath('el-test'));
  });
});

function getExpectedLogPath(appName) {
  var PATH_MAP = {
    darwin: path.join(os.homedir(), 'Library/Logs/{appName}/log.log'),
    linux:  path.join(os.homedir(), '.config/{appName}/log.log'),
    win32:  path.join(os.homedir(), 'AppData/Roaming/{appName}/log.log')
  };

  return (PATH_MAP[process.platform] || PATH_MAP.linux)
    .replace('{appName}', appName);
}
