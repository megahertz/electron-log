'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

module.exports = makeTmpDir;

function makeTmpDir(createFolderOnInit) {
  createFolderOnInit = createFolderOnInit === undefined || createFolderOnInit;
  var dirPath = path.join(os.tmpdir(), 'electron-log-tests');

  if (createFolderOnInit) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return {
    path: dirPath,
    remove: function () {
      fs.rmdirSync(this.path, { recursive: true });
    }
  };
}
