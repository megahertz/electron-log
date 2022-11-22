'use strict';

const { expect, jasmine, test } = require('humile');
const E2eApp = require('../E2eApp');

const app = new E2eApp({ appPath: __dirname });

test(app.appName, async () => {
  const logReader = await app.run();
  expect(logReader.format()).toEqual([
    'log from the main process',
    jasmine.stringContaining('Unhandled main rejection'),
    jasmine.stringContaining('Unhandled main error'),

    'log through global object',
    jasmine.stringContaining('Unhandled renderer error'),
    jasmine.stringContaining('Unhandled renderer rejection'),
  ]);
}, app.timeout);
