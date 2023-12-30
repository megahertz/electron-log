'use strict';

const { expect, test } = require('humile');
const E2eApp = require('../E2eApp');

const app = new E2eApp({ appPath: __dirname });

test(app.appName, async () => {
  if (app.nodeVersion < 16) {
    app.log('Skipping because Vite requires Node 16 for this test');
    return;
  }

  const logReader = await app.run();
  expect(logReader.format()).toEqual([
    'log from the main process',
    'log from renderer',
  ]);
}, app.timeout);
