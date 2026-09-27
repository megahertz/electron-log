'use strict';

const { expect, test } = require('humile');
const E2eApp = require('../E2eApp');

const app = new E2eApp({ appPath: __dirname });

test(app.appName, async () => {
  if (app.electronVersion < 22) {
    app.log(`Skipping utilityProcess test for Electron ${app.electronVersion}`);
    return;
  }

  const logReader = await app.run();
  const lines = logReader.format('{level} {text}')
    .map((line) => line.split('\n')[0]);

  expect(lines).toEqual([
    'info main log from the main process',
    'info utility log from the utility process',
    'warn utility object { a: 1 }',
    'error utility Error: utility error',
    'info utility (worker) scoped log',
  ]);
}, app.timeout);
