'use strict';

const { expect, test } = require('humile');
const E2eApp = require('../E2eApp');

const app = new E2eApp({ appPath: __dirname });

test(app.appName, async () => {
  if (!app.isSupportEsm()) {
    console.info(`Skipping ESM test for Electron ${app.electronVersion}`);
    return;
  }

  const logReader = await app.run();
  expect(logReader.format()).toEqual([
    'log from the main process',
    'log from renderer',
  ]);
}, app.timeout);

function electronSupportsEsm() {

}
