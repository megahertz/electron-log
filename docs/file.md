# File transport

The file transport writes log messages to a file.

## Options

#### `appName` {string} **DEPRECATED**

Default: `undefined`

Determines a location of log file, something like
`~/.config/<app name>/log.log` depending on OS. By default,
electron-log reads this value from `name` or `productName` value in
`package.json`. In most cases you should keep default value.

Deprecated. Use `resolvePath` instead.

#### `archiveLog` {(oldLogFile: LogFile) => void}

Default:

```js
function archiveLog(file) {
  file = file.toString();
  const info = path.parse(file);

  try {
    fs.renameSync(file, path.join(info.dir, info.name + '.old' + info.ext));
  } catch (e) {
    console.warn('Could not rotate log', e);
  }
}
```

Callback which is called on log rotation. You can override it if you need
custom log rotation behavior. This function should remove old file
synchronously.

#### depth {number} **DEPRECATED**

Default: `5`

Sometimes logging a very complex object can produce a huge chunk of data. To
reduce file size set the depth option to exclude nested objects which are deeper
than `depth`.

#### file {string} **DEPRECATED**

Default: `undefined`

The full log file path. I can recommend changing this value only if you
strongly understand what are you doing. If set, `appName` and `fileName`
options are ignored.

Deprecated. Use `resolvePath` instead.

#### `fileName` {string}

Default: `'main.log'`, `'renderer.log'` or  `'worker.log'` depending on
process type

The actual file name without path.

#### `format` {string | (message: LogMessage) => void}

Default: `'[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'`

Determines how to serialize log message while writing to a file.
[Read more](format.md).


#### `inspectOptions` {InspectOptions}

Default: `{ depth: 5 }`

How to serialize objects passed to log function
https://nodejs.org/api/util.html#util_util_inspect_object_options

#### `level` {LogLevel | false}
  
Default: `'silly'`

Filter log messages which can be sent via the transport.

#### `maxSize` {number}

Default: `1048576` (1mb)

Maximum size of a log file in bytes. When a log file exceeds this limit,
it will be moved to {file name}.old.log file. You can set it to 0 to disable
log rotation.
  
#### `resolvePath` {(variables: PathVariables, message?: LogMessage) => string}

Default:
```js
function resolvePath(variables) {
  return path.join(variables.libraryDefaultDir, variables.fileName);
}
```

Allows to set a custom path for a log file. Directory hierarchy will be created
automatically if necessary.

That's just an option, so it's not recommended calling it directly.

The variables argument is just an object of 
[PathVariables type](../src/index.d.ts#L69), which contains several
predefined values. Feel free to choose the most suitable for your application.
  
Electron has built-in method to get logs path `app.getPath('logs')`. But it
seems not stable in the current version. There is a chance that default path on
some platforms might be changed later. However, if you would like to use default
Electron path, just use the following resolver:

```js
log.transports.file.resolvePath = (variables) => {
  return path.join(variables.electronDefaultDir, variables.fileName);
}
```
  
#### `sync` {boolean}
 
Default: `true` 
 
Whether to write a log file synchronously.

#### `writeOptions` {WriteOptions}

Default:

```
{
  encoding: 'utf8',
  flag: 'a',
  mode: 0o666,
}
```

Options for 
[fs.writeFile]https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback

## Methods

#### `clear()` **DEPRECATED**

Clear the current log file.

Deprecated. Use `getFile().clear()` instead.

#### `findLogPath()` **DEPRECATED**

Return full path of the current log file

Deprecated. Use `getFile().path` instead.

#### `getFile(message?: Partial<LogMessage>) => LogFile`

Return the current file instance used for the transport.

The `message` argument is optional and only required if you define log path
inside `resolvePath` callback depending on a message.

#### `init()` **DEPRECATED**

In most cases, you don't need to call it manually. Try
to call only if you change `appName`, `file` or `fileName` property,
but it has no effect.

Deprecated. Doesn't matter anymore.

#### `readAllLogs() => Array<{ path: string, lines: string[] }>`

Reads content of all log files.

Be careful, if you use multiple log directories through overriding resolvePath,
it won't return all the files.

<!-- spech-dictionary whether -->
