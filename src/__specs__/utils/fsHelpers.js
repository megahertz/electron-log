'use strict';

var fs = require('fs');
var path = require('path');

module.exports = {
  /**
   * For running tests using node older than 12.10
   * @param {string} dirPath
   */
  rmDir: function (dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    fs.readdirSync(dirPath).forEach(function (file) {
      var curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        module.exports.rmDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });

    fs.rmdirSync(dirPath);
  },
};
