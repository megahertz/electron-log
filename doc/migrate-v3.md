# Migration from v2 to v3

In v3 each process is configured separately. So if you change some options, you
should apply the changed both in main and renderer processes.

Another changes:
- require 'electron-log/main' and 'electron-log/renderer' is deprecated.
- `transports.file.level` is default to 'silly'.
- `transports.file.stream` and `streamConfig` options are removed. Instead, you
  can use one of the following options: `file`, `fileName`, `writeOptions`.
- `rendererConsole` and `mainConsole` transports are disabled by default for
  a packaged application.
