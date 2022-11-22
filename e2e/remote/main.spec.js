'use strict';

const { expect, test } = require('humile');
const E2eApp = require('../E2eApp');

const app = new E2eApp({ appPath: __dirname });

test(app.appName, async () => {
  const logReader = await app.run();
  expect(logReader.format('{fileName}: {text}')).toEqual([
    'server.log: Request: Remote logging',
    'server.log: Request: 🐛🐛 UTF8 🐛🐛',
  ]);
}, app.timeout);
