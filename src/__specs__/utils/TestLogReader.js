'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

class TestLogReader {
  constructor(appName = null) {
    this.items = [];
    this.appName = appName;
  }

  static getDefaultLogDir(appName) {
    switch (process.platform) {
      case 'darwin': {
        return path.resolve(os.homedir(), 'Library/Logs', appName);
      }
      case 'win32': {
        return path.resolve(os.homedir(), 'AppData/Roaming', appName, 'logs');
      }
      default: {
        return path.resolve(os.homedir(), '.config', appName, 'logs');
      }
    }
  }

  static removeDefaultLogDir(appName) {
    let logDirPath = this.getDefaultLogDir(appName);

    if (process.platform !== 'darwin') {
      logDirPath = path.dirname(logDirPath);
    }

    if (fs.existsSync(logDirPath)) {
      fs.rmSync(logDirPath, { recursive: true });
    }
  }

  static fromApp(appName) {
    const reader = new this(appName);
    reader.loadFilesFromDefaultDir(appName);
    return reader;
  }

  static fromFile(logFilePath) {
    const reader = new this();
    reader.loadFile(logFilePath);
    return reader;
  }

  format(template = '{text}') {
    return this.items.map((item) => template
      .replace('{date}', item.date)
      .replace('{fileName}', item.fileName)
      .replace('{level}', item.level)
      .replace('{text}', item.text));
  }

  loadFile(filePath) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    const items = content.split(os.EOL)
      .filter(Boolean)
      .reduce((result, line) => {
        const matches = line.match(/\[([\w.: -]+)] \[(\w+)]  ?([\s\S]*)/);
        if (matches) {
          return result.concat({
            date: matches[1],
            fileName,
            level: matches[2],
            text: matches[3],
          });
        }

        const lastItem = result[result.length - 1];
        if (lastItem) {
          lastItem.text += `\n${line}`;
        }

        return result;
      }, [])
      .filter(Boolean);

    this.items = this.items.concat(items);
  }

  loadFilesFromDefaultDir(appName = this.appName) {
    const defaultLogDir = this.constructor.getDefaultLogDir(appName);
    for (const logFileName of fs.readdirSync(defaultLogDir)) {
      this.loadFile(path.join(defaultLogDir, logFileName));
    }
  }

  removeLogDir() {
    if (this.appName) {
      this.constructor.removeDefaultLogDir(this.appName);
    }
  }
}

module.exports = TestLogReader;
