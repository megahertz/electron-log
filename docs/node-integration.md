# nodeIntegration

By default, `nodeIntegration` is disabled for a renderer process.

In this case, if you try to use `electron-log` you'll get an error similar to: 

`Uncaught ReferenceError: require is not defined`

## Two ways to solve this problem

### 1. Export a logger interface in the preload script

It's a recommended way.

**main.js**
```js
const window = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
    preload: './preload.js'
  },
});
```

**preload.js**
```js
const log = require('electron-log');

window.log = log.functions;
```

### 2. Enable `nodeIntegration` option when creating a window

It's better to use preload script as described above. But if you need features
provided by `nodeIntegration` and understand all potential risks, you can
enable it:

```js
const window = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: true,
  },
});
```

You should understand all potential security risk when enabling this option. Do
not enable this option if you load some third-party resources to BrowserWindow. 

## Web Workers

Currently, the only way to use node modules in worker is to enable
node integration:

```js
const window = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegrationInWorker: true,
  },
});
```
