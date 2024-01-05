'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { rmDir } = require('../../../../__specs__/utils/fsHelpers');

module.exports = makeTmpDir;

function makeTmpDir(createFolderOnInit) {
  createFolderOnInit = createFolderOnInit === undefined || createFolderOnInit;
  const dirPath = path.join(os.tmpdir(), 'electron-log-tests');

  if (createFolderOnInit) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return {
    path: dirPath,
    remove() {
      rmDir(this.path);
    },
  };
}
