'use strict';

var EventEmitter = require('events');
var fs = require('fs');
var os = require('os');
var path = require('path');
var util = require('util');

var nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);

module.exports = {
  File: File,
  FileRegistry: FileRegistry,
  NullFile: NullFile,
};

/**
 * File manipulations on filesystem
 * @class
 * @extends EventEmitter
 * @property {number} size
 *
 * @constructor
 * @param {string} filePath
 * @param {IWriteOptions} [writeOptions]
 * @param {boolean} [writeAsync]
 */
function File(filePath, writeOptions, writeAsync) {
  EventEmitter.call(this);

  /**
   * @type {string}
   * @readonly
   */
  this.path = filePath;

  /**
   * @type {number}
   * @private
   */
  this.initialSize = undefined;

  /**
   * @type {number}
   * @readonly
   */
  this.bytesWritten = 0;

  /**
   * @type {boolean}
   * @private
   */
  this.writeAsync = Boolean(writeAsync);

  /**
   * @type {IWriteOptions}
   * @private
   */
  this.writeOptions = writeOptions || {
    flag: 'a',
    mode: 438, // 0666
    encoding: 'utf8',
  };

  Object.defineProperty(this, 'size', {
    get: this.getSize.bind(this),
  });
}

util.inherits(File, EventEmitter);

File.prototype.clear = function () {
  try {
    fs.unlinkSync(this.path);
    this.reset();
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      return true;
    }

    this.emit('error', e, this);
    return false;
  }
};

File.prototype.toString = function () {
  return this.path;
};

/**
 * @package
 */
File.prototype.reset = function () {
  this.initialSize = undefined;
  this.bytesWritten = 0;
};

/**
 * @package
 */
File.prototype.writeLine = function (text) {
  text += os.EOL;

  if (this.writeAsync) {
    var file = this;
    fs.writeFile(this.path, text, this.writeOptions, function (e) {
      if (e) {
        file.emit(
          'error',
          new Error('Couldn\'t write to ' + file.path + '. ' + e.message),
          this
        );
      } else {
        file.increaseBytesWrittenCounter(text);
      }
    });
    return;
  }

  try {
    fs.writeFileSync(this.path, text, this.writeOptions);
    this.increaseBytesWrittenCounter(text);
  } catch (e) {
    this.emit(
      'error',
      new Error('Couldn\'t write to ' + this.path + '. ' + e.message),
      this
    );
  }
};

/**
 * @return {number}
 * @protected
 */
File.prototype.getSize = function () {
  if (this.initialSize === undefined) {
    try {
      var stats = fs.statSync(this.path);
      this.initialSize = stats.size;
    } catch (e) {
      this.initialSize = 0;
    }
  }

  return this.initialSize + this.bytesWritten;
};

/**
 * @return {boolean}
 * @package
 */
File.prototype.isNull = function () {
  return false;
};

/**
 * @private
 */
File.prototype.increaseBytesWrittenCounter = function (text) {
  this.bytesWritten += Buffer.byteLength(text, this.writeOptions.encoding);
};

/**
 * File manipulations on filesystem
 * @class
 * @property {number} size
 *
 * @constructor
 * @param {string} filePath
 */
function NullFile(filePath) {
  File.call(this, filePath);
}

util.inherits(NullFile, File);

NullFile.prototype.clear = function () {};
NullFile.prototype.writeLine = function () {};
NullFile.prototype.getSize = function () { return 0 };
NullFile.prototype.isNull = function () { return true };

/**
 * Collection, key is a file path, value is a File instance
 * @class
 *
 * @constructor
 */
function FileRegistry() {
  EventEmitter.call(this);
  this.store = {};

  this.emitError = this.emitError.bind(this);
}

util.inherits(FileRegistry, EventEmitter);

/**
 * Provide a File object corresponding to the filePath
 * @param {string} filePath
 * @param {IWriteOptions} [writeOptions]
 * @param {boolean} [async]
 * @return {File}
 */
FileRegistry.prototype.provide = function (filePath, writeOptions, async) {
  var file;
  try {
    filePath = path.resolve(filePath);

    if (this.store[filePath]) {
      return this.store[filePath];
    }

    file = this.createFile(filePath, writeOptions, Boolean(async));
  } catch (e) {
    file = new NullFile(filePath);
    this.emitError(e, file);
  }

  file.on('error', this.emitError);
  this.store[filePath] = file;
  return file;
};

/**
 * @param {string} filePath
 * @param {IWriteOptions} writeOptions
 * @param {boolean} async
 * @return {File}
 * @private
 */
FileRegistry.prototype.createFile = function (filePath, writeOptions, async) {
  this.testFileWriting(filePath);
  return new File(filePath, writeOptions, async);
};

/**
 * @param {Error} error
 * @param {File} file
 * @private
 */
FileRegistry.prototype.emitError = function (error, file) {
  this.emit('error', error, file);
};

/**
 * @param {string} filePath
 * @private
 */
FileRegistry.prototype.testFileWriting = function (filePath) {
  mkDir(path.dirname(filePath));
  fs.writeFileSync(filePath, '', { flag: 'a' });
};

function mkDir(dirPath) {
  if (nodeVersion > 10.12) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }

  try {
    fs.mkdirSync(dirPath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return mkDir(path.dirname(dirPath)) && mkDir(dirPath);
    }

    try {
      if (fs.statSync(dirPath).isDirectory()) {
        return true;
      }

      // noinspection ExceptionCaughtLocallyJS
      throw error;
    } catch (e) {
      throw e;
    }
  }
}
