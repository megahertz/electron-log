# Old versions and migration

You can continue to use some older version or migrate to the latest. Here are
documentation and code snapshot for older releases:
[v2](https://github.com/megahertz/electron-log/tree/v2.2.17),
[v3](https://github.com/megahertz/electron-log/tree/v3.0.9).

If you would like to upgrade to the latest version, check
[the changelog](../CHANGELOG.md) and migration guide below.

## Migration from v3 to v4

`npm install electron-log@latest`

If you just use electron-log with default configuration you only need to know
that a default log file path was changed.

### File transport

 - Default log path was changed on Linux and Windows to be more compatible
   with `app.getPath('logs')` of Electron:
   
   ~/.config/{app name}/**log.log** →
   
   ~/.config/{app name}/**logs/{process type}.log**
   
   %USERPROFILE%\\AppData\\Roaming\\{app name}\\**log.log** →
   
   %USERPROFILE%\\AppData\\Roaming\\{app name}\\**logs\\{process type}.log**
   
   If you need to keep old file paths, you can override `file.resolvePath` 
   
 - `file.fileName` is now `main.log` and `renderer.log` depending on process
   type
   
 - new option `file.resolvePath` allows to override default log path. Here
   is default implementation: 
   
   ```js
     log.transports.file.resolvePath = (variables) => {
       return path.join(variables.libraryDefaultDir, variables.fileName);
     }
   ```
   
   - new method `file.getFile()` was added. It allows to manipulate the current
     log file.
   
 - The following file transport options and methods are deprecated and will be
   removed in v5:
 
   - `file.file`, use `file.resolvePath` instead
   - `file.bytesWritten`, use `file.getFile().bytesWritten` instead
   - `file.fileSize`, use `file.getFile().size` instead
   - `file.clear()`, use `file.getFile().clear()` instead
   - `file.findLogPath()`, use `file.getFile().path` instead
   - `file.init()`, doesn't matter anymore
   
### `mainConsole` and `rendererConsole` are combined into `ipc` transport

If you change some options of these transport, just use the same options of
`ipc` transport instead.

## Migration from v2 to v3

`npm install electron-log@latest`

In v3 each process is configured separately. So if you change some options, you
should apply the changed both in main and renderer processes.

Another changes:

 - require 'electron-log/main' and 'electron-log/renderer' is deprecated.
 - `transports.file.level` is default to 'silly'.
 - `transports.file.stream` and `streamConfig` options are removed. Instead, you
   can use one of the following options: `file`, `fileName`, `writeOptions`.
 - `rendererConsole` and `mainConsole` transports are disabled by default for
   a packaged application.
