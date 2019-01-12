# File transport

The file transport writes log messages to a file.

## Options

- **appName** determines a location of log file, something like
  `~/.config/<app name>/log.log` depending on OS. By default
  electron-log reads this value from `name` or `productName` value in
  `package.json`. In most cases you should keep default value.

- **archiveLog** Function (oldLogPath: string) => void which is called on log
  rotation. You can override it if you need custom log rotation behavior. This
  function should remove old file synchronously.

- **file** - The full log file path. I can recommend to change this
  value only if you strongly understand what are you doing. If set,
  `appName` and `fileName` options are ignored.

- **fileName**, default 'log.log'

- **[format](doc/format.md)**, default
  `'[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'`
  
- **level**, default 'silly'

- **maxSize** of log file in bytes, 1048576 (1mb) by default. When a
  log file exceeds this limit, it will be moved to log.old.log file
  and the current file will be cleared. You can set it to `0` to disable
  
  
- **sync** Whether to write a log file synchronously. Default to true.

- **writeOptions**
    - **[flag](https://nodejs.org/api/fs.html#fs_file_system_flags)**,
      default 'a'
    - **mode**, default 0666
    - **encoding**, default 'utf8'

## Methods

- **clear()** - Clear the current log file

- **findLogPath()** - Return full path of the current log file

- **init()** - In most cases, you don't need to call it manually. Try
  to call only if you change `appName`, `file` or `fileName` property,
  but it has no effect.
