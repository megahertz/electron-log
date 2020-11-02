# Changelog

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
   See updated [Override transport section](README.md#override-transport) if you
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
