# Logging from a utility process

Utility processes don't automatically forward logs to the main process. Use
`process.parentPort` to send them to the main process logger.

## Utility process

**utility.js**
```js
import log from 'electron-log/node';

log.variables.processType = 'utility';
log.transports = {
  parentPort: (msg) => process.parentPort.postMessage({ __electronLog: msg }),
};

log.info('Log from the utility process');
```

## Main process

Pass incoming log messages to `log.processMessage()` to use the main process's
configured transports.

**main.js**
```js
import { utilityProcess } from 'electron';
import log from 'electron-log/main';

const child = utilityProcess.fork('utility.js');
child.on('message', (payload) => {
  if (payload?.__electronLog) {
    log.processMessage(payload.__electronLog);
  }
});
```

## Identifying utility process logs

The example sets `processType` to `utility`. Include `{processType}` in the main
process's log format to show where each message came from:

```js
log.transports.file.format = '[{h}:{i}:{s}.{ms}] [{processType}] [{level}]{scope} {text}';
```

Alternatively, use a [scope](../README.md#logging-scopes) in the utility process:

```js
const utilityLog = log.scope('worker');
utilityLog.info('Log from the utility process');
```

## Alternative: pipe stdout/stderr

If you can't change the utility process code, capture its stdout and stderr
instead. Stdout is logged as `info` and stderr as `error`. Messages may be split
across entries or combined into one.

```js
const child = utilityProcess.fork('utility.js', [], { stdio: 'pipe' });

child.stdout.on('data', (data) => log.info(data.toString().trimEnd()));
child.stderr.on('data', (data) => log.error(data.toString().trimEnd()));
```
