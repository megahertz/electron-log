# electron-log
[![Build Status](https://travis-ci.org/megahertz/electron-log.svg?branch=master)](https://travis-ci.org/megahertz/electron-log)
[![NPM version](https://badge.fury.io/js/electron-log.svg)](https://badge.fury.io/js/electron-log)
[![Dependencies status](https://david-dm.org/megahertz/electron-log/status.svg)](https://david-dm.org/megahertz/electron-log)

## Description

Just a simple logging module for your Electron or NW.js application.
No dependencies. No complicated configuration. Just require and use.
Also, it can be used without Electron in any node.js application.

By default it writes logs to the following locations:

 * **on Linux:** `~/.config/<app name>/log.log`
 * **on macOS:** `~/Library/Logs/<app name>/log.log`
 * **on Windows:** `%USERPROFILE%\AppData\Roaming\<app name>\log.log`

## Installation

Install with [npm](https://npmjs.org/package/electron-log):

    npm install electron-log

## Usage

```js
const log = require('electron-log');

log.info('Hello, log');
log.warn('Some problem appears');
```

### electron-log v2.x

Documentation for 
[v2.x is here](https://github.com/megahertz/electron-log/tree/v2.2.17).
Read [the migration guide](doc/migrate-v3.md) to update to v3.x

### Log levels

electron-log supports the following log levels:

    error, warn, info, verbose, debug, silly

### Transport

Transport is a simple function which does some work with log message.
By default, two transports are active: console and file. 

If you change some transport options, make sure you apply the changes both in
main and renderer processes.

You can set transport options or use methods using:

`log.transports.console.format = '{h}:{i}:{s} {text}';`

`log.transports.file.clear();`

#### Console transport

Just prints a log message to application console (main process) or to
DevTools console (renderer process).

##### Options

- **[format](doc/format.md)**, default
  `'%c{h}:{i}:{s}.{ms}%c › {text}'` (main),
  `'{h}:{i}:{s}.{ms} › {text}'` (renderer)
- **level**, default 'silly'

#### File transport

The file transport writes log messages to a file.

##### Options

- **fileName**, default 'log.log'
- **[format](doc/format.md)**, default
  `'[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'`
- **level**, default 'silly'
- **maxSize** of log file in bytes, 1048576 (1mb) by default.

[Detailed description](doc/file.md) of file transport options and methods.

#### Renderer console transport

When logging inside main process, it shows log in DevTools console too.
This transport can impact on performance, so it's disabled by default
for packaged application.

#### Main console transport

When logging inside renderer process, it shows log in application
console too. This transport can impact on performance, so it's disabled
by default for packaged application.

#### Remote transport

Sends a JSON POST request with ILogMessage in the body to the specified url.

##### Options

- **level**, default false
- **url**

#### Disable a transport

Just set level property to false, for example:

```js
log.transports.file.level = false;
log.transports.console.level = false;
```

#### [Override/add a custom transport](doc/extend.md#transport)

Transport is just a function `(msg: ILogMessage) => void`, so you can
easily override/add your own transport.
[More info.](doc/extend.md#transport)

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

### Catch errors

electron-log can catch and log unhandled errors/rejected promises:

`log.catchErrors(options = {})`;

##### Options

- **showDialog**, default true for the main process. Set it to false to prevent
  showing a default electron error dialog
- **onError**, (error) => void | false, default null - attach a custom
  error handler. If the handler returns false, this error will not be processed.

### [Hooks](doc/extend.md#hooks)

In some situations, you may want to get more control over logging. Hook
is a function which is called on each transport call.

`(msg: ILogMessage, transport: ITransport) => ILogMessage`

[More info.](doc/extend.md#hooks)

## License

Licensed under MIT.
