'use strict';

const { expect, test } = require('humile');
const E2eApp = require('../E2eApp');

const app = new E2eApp({ appPath: __dirname });

test(app.appName, async () => {
  const logReader = await app.run();
  expect(logReader.format()).toEqual([
    'log from the main process',
    'log from the first renderer process',
    'log from the second renderer process',
  ]);
}, app.timeout);
