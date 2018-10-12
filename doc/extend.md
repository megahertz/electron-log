# Extending electron-log

## Transport

Transport is just a function `(msg: IMessage) => void`, so you can
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
is a function which is called on each logging.

`(msg: IMessage, transports: ITransports) => IMessage`

transports is a simple object `{ [name: string]: ITransport }` like
`log.transports`, but it contains only transports which will be used
for the current message. You can modify it to enable/disable some
transports.

Hook function return source or modified message. If hook function
returns false, the current message will not be logged.

In this example the file transport is disabled for all messages which
contain 'password' phrase:

```js
log.hooks.push((msg, transports) => {
  if (msg.data[0].includes('password')) {
    delete transports.file;
  }

  return msg;
});
```

## IMessage

 - data: any[] Arguments passed to log function
 - date: Date
 - level: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'
 - variables?: { [name: string]: any } When log message is created,
   values from log.variables are saved here (to make it possible to
   pass message between different processes)
