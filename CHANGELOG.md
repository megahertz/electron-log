# Changelog

## 5.4.2

- [#472](https://github.com/megahertz/electron-log/pull/472) Add the gray color
  and `log.transports.console.colorMap` option.

## 5.4.0

- [#465](https://github.com/megahertz/electron-log/issues/465) Allow using `%c` 
  template for the `transports.console.format`. This change may break formatting
  if you already use `%c` in your format string. In this case, you can run 
  `log.transports.console.transforms.shift()` before initializing the logger.

## 5.2.4

- Add Buffering feature.

## 5.2.0

- [fix](https://github.com/megahertz/electron-log/commit/a52f3e5863ba5caf6cb19b2cdb32c43d28545b9d):
  [#436](https://github.com/megahertz/electron-log/issues/436) `log.log` 
  isn't bound to `log.info`. Previously, it was processed with non-existent
  `log` level.

## 5.1.0

- New entry point for NW.js / Node.js apps: `'electron-log/node'`

## 5.0.0

### Core
 - Now it's a time to use modern ES instead of ES5. It was a joy to use
   old-fashioned ES5, but since the library grows it becomes
   harder to follow its restrictions. Starting from v5 the library
   requires Node.js 14+ or Electron 13 at least.
 - Now a renderer process just sends log data to the main through IPC,
   so only the main logger can be configured. See
   [initialize](docs/initialize.md) for more information
 - A new `tranforms` property is added for each transport. It allows to
   configure transformations preformed on message data. See
   [transforms](docs/extend.md#transforms) for more information.
 - `log.create(logId)` is replaced by `log.create({ logId })`

### File transport
 
 - `archiveLog` options is renamed to `archiveLogFn`
 - `resolvePath` options is renamed to `resolvePathFn`
 - All logs are written to main.log file. If you want to write renderer
   logs to a separated file, you can do that by overriding `resolvePathFn`

### Console transport

 - `writeFn` callback is added. By default, it just passes `message.data` to
   `console.log` function

### Remote transport

 - `onError` is renamed to `processErrorFn({ error, message, request })`
 - `transformBody` is renamed to `makeBodyFn({ logger, message, transport })`

### Electron event logger

To simplify app debugging the 
[Electron event logging](https://github.com/megahertz/electron-log/blob/master/docs/events.md)
was implemented.

## 4.4.0 
 - Disable auto-loading of electron-log in the main process for using by ipc
   transport

## 4.3.0
 - Add `transport.file.inspectOptions`
 - `transport.file.depth` is deprecated

## 4.2.3

 - Add `transports.remote.onError` option
 - Add `logMessageWithTransports` method
 - Add `transports.file.readAllLogs` method

## 4.2.2

 - Add `transports.file.depth` option

## 4.2.0

 - Feature: Helper for custom log levels: log.levels.add
 - Stringify Errors instead of converting to object
 - Feature: Submit error report to github or other source

## 4.1.0

 - Feature: Scopes

## 4.0.0

### Core
 - multiple logger instances support.
 
   `const log = electronLog.create('loggerId')`
   
 - add object `log.functions`
 
 - Web Workers support

### File transport
 - New default log file path:
    - **on Linux:** `~/.config/{app name}/logs/{process type}.log`
    - **on macOS:** `~/Library/Logs/{app name}/{process type}.log`
    - **on Windows:** `%USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log`
  
  
 - the option `file.fileName` is now `main.log`, `renderer.log` or `worker.log`
   depending on process type
 - new option `file.resolvePath`
 - new method `file.getFile()`


 - deprecated `file.file`, use `file.resolvePath` instead
 - deprecated `file.bytesWritten`, use `file.getFile().bytesWritten` instead
 - deprecated `file.fileSize`, use `file.getFile().size` instead
 - deprecated `file.clear()`, use `file.getFile().clear()` instead
 - deprecated `file.findLogPath()`, use `file.getFile().path` instead
 - deprecated `file.init()`, doesn't matter anymore

### IPC transport

 - `mainConsole` and `rendererConsole` are combined into `ipc` transport

## 3.0.0
 - Now IPC is used only for some transports, which are disabled for a
   packaged application. So now electron-log works using almost the same
   way in the main and renderer processes. The reason - IPC is pretty slow
   and can freeze an application when there are a lot of calls.
 - File transport doesn't use `stream.Writable` anymore.
 - New feature: hooks.
 - New feature: log file clearing.
 - New feature: colors support.
 - New feature: errors catching.
 - Changed default format option for console transport.
 - log-s transport is renamed to remote.

## 2.1.0
 - Add Renderer Console transport

## 2.0.0
 - Move log.appName property to log.transports.file.appName.
 - Change a log message object.
   See updated [Override transport section](docs/extend.md) if you
   use custom transport.
 - Now it's not possible to configure transports from a renderer
   process, only from the main.
 - To disable a transport set its level to `false`.
 - Fix problems when this package is used from a renderer process.
 - Add Typescript definitions.
 - Add [log-s](https://github.com/megahertz/log-s) transport
   (experimental).
 - Fix file transport appName detection when an application is run
 in dev environment (through `electron .` or similar way)

## 1.3.0
 - #18 Rename 'warning' log level to 'warn'

## 1.2.0
 - #14 Use native console levels instead of console.log

## 1.0.16
 - Prefer to use package.json:productName instead of package.json:name
 to determine a log path.
