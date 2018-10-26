# electron-log
[![Build Status](https://travis-ci.org/megahertz/electron-log.svg?branch=master)](https://travis-ci.org/megahertz/electron-log)
[![NPM version](https://badge.fury.io/js/electron-log.svg)](https://badge.fury.io/js/electron-log)
[![Dependencies status](https://david-dm.org/megahertz/electron-log/status.svg)](https://david-dm.org/megahertz/electron-log)

## Description

Just a simple logging module for your Electron or NW.js application.
No dependencies. No complicated configuration. Just require and use.
Also, it can be used without Electron in any node

By default it writes logs to the following locations:

 * **on Linux:** `~/.config/<app name>/log.log`
 * **on OS X:** `~/Library/Logs/<app name>/log.log`
 * **on Windows:** `%USERPROFILE%\AppData\Roaming\<app name>\log.log`

## Installation

Install with [npm](https://npmjs.org/package/electron-log):

    npm install electron-log

## Usage

```js
const log = require('electron-log');

log.info('Hello, log');
```

### Log levels

electron-log supports the following log levels:

    error, warn, info, verbose, debug, silly

### Transport

Transport is a simple function which does some work with log message.
By default, two transports are active: console and file.

#### Console transport

Just prints a log message to application console (main process) or to
DevTool console (renderer process).

##### Options

- **[format](doc/format.md)**, default
  ``'[{h}:{i}:{s}.{ms}] [{level}] {text}'``
- **level**, default 'silly'

#### File transport

The file transport writes log messages to a file.

##### Options

- **appName** determines a location of log file, something like
  `~/.config/<app name>/log.log` depending on OS. By default
  electron-log reads this value from `name` or `productName` value in
  `package.json`. In most cases you should keep default value.

- **file** - The full log file path. I can recommend to change this
  value only if you strongly understand what are you doing. If set,
  `appName` and `fileName` options are ignored.

- **fileName**, default 'log.log'
- **[format](doc/format.md)**, default
  ``'[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'``
- **level**, default 'silly'
- **maxSize** of log file in bytes, 1048576 (1mb) by default. When a
  log file exceeds this limit, it will be moved to log.old.log file
  and the current file will be cleared. You can set it to `0` to disable
  this feature.
- **sync** Whether to write a log file synchronously. Default to true.
- **writeOptions**
    - **[flag](https://nodejs.org/api/fs.html#fs_file_system_flags)**,
      default 'a'
    - **mode**, default 0666
    - **encoding**, default 'utf8'

##### Methods

- **clear()** - Clear the current log file
- **findLogPath()** - Return full path of the current log file
- **init()** - In most cases, you don't need to call it manually. Try
  to call only if you change `appName`, `file` or `fileName` property,
  but it has no effect.

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

### [Hooks](doc/extend.md#hooks)

In some situations, you may want to get more control over logging. Hook
is a function which is called on each logging.

`(msg: ILogMessage, transports: ITransports) => ILogMessage`

[More info.](doc/extend.md#hooks)

## Change Log

**3.0.0-beta**
 - Now IPC is used only for some transports, which are disabled for a
   packaged application. So now electron-log works using almost the same
   way in main and renderer processes. The reason - IPC is pretty slow
   and can freeze an application when there are a lot of calls.
 - File transport doesn't use stream.Writable anymore.
 - New feature: hooks.
 - New feature: log file clearing.
 - log-s transport is renamed to remote.

**2.1.0**
 - Add Renderer Console transport

**2.0.0**
 - Move log.appName property to log.transports.file.appName.
 - Change a log message object. See updated
 [Override transport section](#override-transport) if you use a custom
 transport.
 - Now it's not possible to configure transports from a renderer
 process, only from the main.
 - To disable a transport set its level to false.
 - Fix problems when this package is used from a renderer process.
 - Add Typescript definitions.
 - Add [log-s](https://github.com/megahertz/log-s) transport
 (experimental).
 - Fix file transport appName detection when an application is run
 in dev environment (through `electron .` or similar way)

**1.3.0**

- #18 Rename 'warning' log level to 'warn'

**1.2.0**

 - #14 Use native console levels instead of console.log

**1.0.16**

 - Prefer to use package.json:productName instead of package.json:name
 to determine a log path.

## License

Licensed under MIT.
