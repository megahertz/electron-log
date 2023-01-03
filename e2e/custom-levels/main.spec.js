'use strict';

const { expect, test } = require('humile');
const E2eApp = require('../E2eApp');

const app = new E2eApp({ appPath: __dirname });

test(app.appName, async () => {
  const logReader = await app.run();
  expect(logReader.format('{level}: {text}')).toEqual([
    'notice: log from the main process',
    'notice: log through global object',
  ]);
}, app.timeout);
