# Troubleshooting

## Cannot find module 'electron-log/main' in production

The module isn't included in the packaged app. Common causes:

 - Two package.json setup (e.g. angular-electron): electron-builder installs
   dependencies from `app/package.json`, so add `electron-log` there.
 - Bundler (webpack, vite): either bundle electron-log or keep it external
   and make sure it's in the packaged `node_modules`.

## Main process logs aren't shown in DevTools in production

The IPC transport is disabled in production builds. Enable it by setting
a level:

```js
log.transports.ipc.level = 'info';
```

## Renderer logs don't reach the main process

 - Make sure `log.initialize()` is called in the main process.
 - If a window uses a custom session created before `log.initialize()`,
   pass it explicitly. [Read more](initialize.md#using-custom-sessions).

## Utility process logs are missing

Logs from a `utilityProcess` aren't forwarded automatically.
[Read how to forward them](utility.md).

## Too much log output when running tests

App bootstrap code isn't executed in unit tests, so electron-log uses
default levels. Configure it in a setup file loaded by your test runner:

```js
// test/setup-log.js
const log = require('electron-log/main');
log.transports.console.level = 'warn';
```

```sh
electron-mocha --require-main test/setup-log.js
```

For Jest or Vitest, add this file to `setupFiles`.
