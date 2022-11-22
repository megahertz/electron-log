'use strict';

const { expect, test } = require('humile');
const E2eApp = require('../E2eApp');

const app = new E2eApp({ appPath: __dirname });

test(app.appName, async () => {
  const logReader = await app.run();
  expect(logReader.format()).toEqual([
    'node debug',
    'node warn',
  ]);
}, app.timeout);
