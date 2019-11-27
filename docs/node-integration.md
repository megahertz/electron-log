# nodeIntegration

By default, `nodeIntegration` is disabled for a renderer process.

In this case, if you try to use `electron-log` you'll get an error similar to: 

`Uncaught ReferenceError: require is not defined`

There are two ways to solve this problem

## Export a logger interface in the preload script

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

## Enable `nodeIntegration` when creating a window

Its better to use preload script as described above. But if you need features
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
