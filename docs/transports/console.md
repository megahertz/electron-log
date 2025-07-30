# Console transport

Displays a log message in the console

## Options

#### `colorMap` {Record<LogLevel, string>}

Default:
```
{
  error: 'red', 
  warn: 'yellow',
  info: 'cyan',
  verbose: 'unset',
  debug: 'gray',
  silly: 'gray',
  default: 'unset',
}
```

A map of log levels to colors.

#### `format` {string | (message: LogMessage) => void}

Default: `'[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'`

Determines how to serialize log message while writing to a file.
[Read more](format.md).

#### `level` {LogLevel | false}

Default: `false`

Filter log messages which can be sent via the transport.

#### `useStyles` {boolean}

By default, it tries to determine whether it's possible to use colors in
console. You can set it to true/false to force enable/disable that.

Default: `undefined`

#### `writeFn` {(options: { message: LogMessage }) => void}

A function which actually prints formatted console message to console. You can
override it if you want to use some third-party library for that.
