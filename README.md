# electron-log
[![Build Status](https://travis-ci.org/megahertz/electron-log.svg?branch=master)](https://travis-ci.org/megahertz/electron-log)
[![NPM version](https://badge.fury.io/js/electron-log.svg)](https://badge.fury.io/js/electron-log)
[![Dependencies status](https://img.shields.io/david/megahertz/electron-log)](https://david-dm.org/megahertz/electron-log)

Just a simple logging module for your Electron or NW.js application.
No dependencies. No complicated configuration. Just require and use.
Also, it can be used without Electron in any node.js application.

By default, it writes logs to the following locations:

 - **on Linux:** `~/.config/{app name}/logs/{process type}.log`
 - **on macOS:** `~/Library/Logs/{app name}/{process type}.log`
 - **on Windows:** `%USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log`

## Installation

Install with [npm](https://npmjs.org/package/electron-log):

    npm install electron-log
    
## Usage

```js
const log = require('electron-log');

log.info('Hello, log');
log.warn('Some problem appears');
```

### electron-log v2.x, v3.x

If you would like to upgrade to the latest version, read
[the migration guide](docs/migration.md) and [the changelog](CHANGELOG.md).

### Log levels

electron-log supports the following log levels:

    error, warn, info, verbose, debug, silly

### `nodeIntegration`
If you've got an error like `require is not defined` in a renderer process,
read [the nodeIntegration section](docs/node-integration.md).

### Transport

Transport is a simple function which does some work with log message.
By default, two transports are active: console and file. 

**If you change some transport options, make sure you apply the changes both in
main and renderer processes.**

You can set transport options or use methods using:

`log.transports.console.format = '{h}:{i}:{s} {text}';`

`log.transports.file.getFile();`

#### Console transport

Just prints a log message to application console (main process) or to
DevTools console (renderer process).

##### Options

 - **[format](docs/format.md)**, default
   `'%c{h}:{i}:{s}.{ms}%c › {text}'` (main),
   `'{h}:{i}:{s}.{ms} › {text}'` (renderer)
 - **level**, default 'silly'
 - **useStyles**, use styles in the main process even if TTY isn't attached,
   default `null`

#### File transport

The file transport writes log messages to a file.

##### Options

 - **[format](docs/format.md)**, default
   `'[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'`
 - **level**, default 'silly'
 - **resolvePath** function sets the log path, for example
 
```js
log.transports.file.resolvePath = () => path.join(APP_DATA, 'logs/main.log');
```

[Read more about file transport](docs/file.md).

#### IPC transport
When logging inside renderer process, it also shows log in application
console and vice versa. This transport can impact on performance, so
it's disabled by default for packaged application.

##### Options

 - **level**, default 'silly'

#### Remote transport

Sends a JSON POST request with `LogMessage` in the body to the specified url.

##### Options

 - **level**, default false
 - **url**, remote endpoint

[Read more about remote transport](docs/remote.md).

#### Disable a transport

Just set level property to false, for example:

```js
log.transports.file.level = false;
log.transports.console.level = false;
```

#### [Override/add a custom transport](docs/extend.md#transport)

Transport is just a function `(msg: LogMessage) => void`, so you can
easily override/add your own transport.
[More info](docs/extend.md#transport).

### Overriding console.log

Sometimes it's helpful to use electron-log instead of default `console`. It's
pretty easy:

```js
console.log = log.log;
```

If you would like to override other functions like `error`, `warn` and so on:

```js
Object.assign(console, log.functions);
```

### Colors

Colors can be used for both main and DevTools console.

`log.info('%cRed text. %cGreen text', 'color: red', 'color: green')`

Available colors:
 - unset (reset to default color)
 - black
 - red
 - green
 - yellow
 - blue
 - magenta
 - cyan
 - white
 
For DevTools console you can use other CSS properties.

### [Catch errors](docs/catch.md)

electron-log can catch and log unhandled errors/rejected promises:

`log.catchErrors(options?)`;

[More info](docs/catch.md).

### [Hooks](docs/extend.md#hooks)

In some situations, you may want to get more control over logging. Hook
is a function which is called on each transport call.

`(message: LogMessage, transport: Transport) => LogMessage`

[More info](docs/extend.md#hooks).

### Multiple logger instances

You can create multiple logger instances with different settings:

```js
const electronLog = require('electron-log');

const log = electronLog.create('anotherInstance');
````

### Logging scopes

```js
const log = require('electron-log');
const userLog = log.scope('user');

userLog.info('message with user scope');
// Prints 12:12:21.962 (user) › message with user scope
```

### Web Worker

It's possible to use the module with Web Worker. However, ipc transport is not
active, so log messages from worker are not displayed in the main app console.

## Related

 - [electron-cfg](https://github.com/megahertz/electron-cfg) -
   Settings for your Electron application.
