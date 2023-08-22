# Save electron events

Sometimes it's helpful to save critical electron events to the log file.

`log.eventLogger.startLogging(options?)`;

By default, it save the following events:
- `certificate-error`, `child-process-gone`, `render-process-gone` of `app`
- `crashed`, `gpu-process-crashed` of `webContents`
- `did-fail-load`, `did-fail-provisional-load`, `plugin-crashed`,
  `preload-error` of every WebContents. You can switch any event on/off.

#### `log.eventLogger.startLogging(options?)`

Start saving logs. See options argument description below.

#### `log.eventLogger.stopLogging()`

Stop saving logs.

#### `log.eventLogger.setOptions()`

Set logging options.

#### `log.eventLogger.format` {string | Function}

Default: `'{eventSource}#{eventName}:'`

Custom format example:

```js
log.eventLogger.format = ({ eventName, eventSource, handlerArgs }) => {
  const [event, ...eventArgs] = handlerArgs;
  return [`${eventSource}#${eventName}:`, JSON.stringify(eventArgs)];
};
```

#### `log.eventLogger.formatters` {object}

A set of function which formats a specific event.

```js
log.eventLogger.formatters.webContents['console-message'] = ({
  args: [level, message, line, sourceId],
  event,
  eventName,
  eventSource
}) => {
  const webContents = event.sender;

  if (level > 2) {
    return undefined;
  }

  return { message, source: `${sourceId}:${line}`, url: webContents?.getURL() };
};
```

#### `log.eventLogger.events` {object}

Allow to switch specific events on/off easily

Default:

```js
log.eventLogger.events = {
  app: {
    'certificate-error': true,
    'child-process-gone': true,
    'render-process-gone': true,
  },
  webContents: {
    'did-fail-load': true,
    'did-fail-provisional-load': true,
    'plugin-crashed': true,
    'preload-error': true,
    'unresponsive': true,
  }
}
```

#### `log.eventLogger.level` {LogLevel}

Which log level is used for logging

Default: `'warn'`

#### `log.eventLogger.scope` {LogLevel}

Which log scope is used for logging

Default: `''`

### Options

Options is just an object which may contain some eventLogger properties
(`events`, `level`, `logger`, `format`, `formatters`, `scope`)
