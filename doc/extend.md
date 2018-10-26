# Extending electron-log

## Transport

Transport is just a function `(msg: ILogMessage) => void`, so you can
easily override/add your own transport.

```js
const format = require('util');

log.transports.console = (msg) => {
  const text = util.format.apply(util, msg.data);
  console.log(`[${msg.date.toLocaleTimeString()} ${msg.level}] ${text}`);
};
```

Please be aware, if you override a transport function the default
transport options (like level or format) will be undefined.

## Hooks

In some situations, you may want to get more control over logging. Hook
is a function which is called on each transport call.

`(msg: ILogMessage, transport: ITransport) => ILogMessage`

Hook function return original or modified message. If the hook function
returns false, the current transport will be skipped.

In this example the file transport is disabled for all messages which
contain 'password' phrase:

```js
log.hooks.push((msg, transport) => {
  if (transport !== log.transports.file) {
    return msg;
  }

  if (msg.data[0].includes('password')) {
    return false;
  }

  return msg;
});
```

## ILogMessage

 - data: any[] Arguments passed to log function
 - date: Date
 - level: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'
 - variables?: { [name: string]: any } When log message is created,
   values from log.variables are saved here (to make it possible to
   pass message between different processes)
