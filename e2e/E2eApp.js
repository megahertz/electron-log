'use strict';

const { exec } = require('child_process');
const electronPackageJson = require('electron/package.json');
const fs = require('fs');
const path = require('path');
const TestLogReader = require('../src/__specs__/utils/TestLogReader');

class E2eApp {
  constructor({ appPath, timeout = process.env.CI ? 30000 : 7000 }) {
    this.appPath = appPath;
    this.timeout = timeout;
  }

  get appName() {
    if (!this.appNameCache) {
      const packageJsonPath = path.join(this.appPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      this.appNameCache = packageJson.name;
    }

    return this.appNameCache;
  }

  get electronVersion() {
    return Number.parseInt(electronPackageJson.version, 10);
  }

  get nodeVersion() {
    return Number.parseInt(process.version.replace('v', ''), 10);
  }

  isSupportEsm() {
    return this.electronVersion >= 28;
  }

  log(...args) {
    console.info('E2E:', ...args); // eslint-disable-line no-console
  }

  async run({ clearLogs = true } = {}) {
    if (clearLogs) {
      await this.removeLogDir();
    }

    await this.runApplication();
    const logReader = this.readLog();

    if (clearLogs) {
      await this.removeLogDir();
    }

    return logReader;
  }

  readLog() {
    return TestLogReader.fromApp(this.appName);
  }

  removeLogDir() {
    TestLogReader.removeDefaultLogDir(this.appName);
  }

  async runApplication() {
    return new Promise((resolve, reject) => {
      let isFinished = false;
      const output = [];

      let additionalArgs = '';
      if (process.platform === 'linux') {
        additionalArgs += ' --no-sandbox';
      }

      const app = exec(`npm start -- --test${additionalArgs}`, {
        cwd: this.appPath,
        env: { ...process.env, FORCE_STYLES: true },
      }, done);

      collectOutput(app.stdout);
      collectOutput(app.stderr);

      const timeoutId = setTimeout(() => {
        done(new Error(
          `Terminate ${this.appPath} by timeout (${this.timeout / 1000}s)`,
        ));
        app.kill('SIGKILL');
      }, this.timeout - 100);

      function done(error) {
        if (isFinished) {
          return;
        }

        isFinished = true;
        clearTimeout(timeoutId);

        const outputText = output
          .join('\n')
          .replace(/^Fontconfig.*$/mg, '')
          .replace(/^.*Desktop Identity.*$/mg, '')
          .replace(/^.*Gtk-WARNING.*$/mg, '')
          .replace(/^.*bus.cc.*$/mg, '')
          .replace(/^.*viz_main_impl.cc.*$/mg, '')
          .replace(/^\n/mg, '');

        // eslint-disable-next-line no-console
        console.debug ? console.debug(outputText) : console.log(outputText);

        error ? reject(error) : resolve();
      }

      function collectOutput(pipe) {
        pipe.on('data', (chunk) => { output.push(chunk.toString()) });
      }
    });
  }
}

module.exports = E2eApp;
