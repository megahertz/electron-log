# Changelog

**3.0.0-beta**
 - Now IPC is used only for some transports, which are disabled for a
   packaged application. So now electron-log works using almost the same
   way in main and renderer processes. The reason - IPC is pretty slow
   and can freeze an application when there are a lot of calls.
 - File transport doesn't use stream.Writable anymore.
 - New feature: hooks.
 - New feature: log file clearing.
 - New feature: colors support.
 - New feature: errors catching.
 - Changed default format option for console transport.
 - log-s transport is renamed to remote.

**2.1.0**
 - Add Renderer Console transport

**2.0.0**
 - Move log.appName property to log.transports.file.appName.
 - Change a log message object. See updated
 [Override transport section](README.md#override-transport) if you use a custom
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
