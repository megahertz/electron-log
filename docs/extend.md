# Extending electron-log

## Transport

Transport is just a function `(msg: LogMessage) => void`, so you can
easily override/add your own transport.

```js
const format = require('util');

log.transports.console = (message) => {
  const text = util.format.apply(util, message.data);
  console.log(`[${message.date.toLocaleTimeString()} ${message.level}] ${text}`);
};
```

Please be aware, if you override a transport function the default
transport options (like level or format) will be undefined.

## Hooks

In some situations, you may want to get more control over logging. Hook
is a function which is called on each transport call.

`(msg: LogMessage, transport: Transport) => LogMessage`

Hook function return original or modified message. If the hook function
returns false, the current transport will be skipped.

In this example the file transport is disabled for all messages which
contain 'password' phrase:

```js
log.hooks.push((message, transport) => {
  if (transport !== log.transports.file) {
    return message;
  }

  if (message.data[0].includes('password')) {
    return false;
  }

  return message;
});
```

## LogMessage

 - data: any[] Arguments passed to log function
 - date: Date
 - level: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'
 - styles: string[] strings like 'color: red' 
 - variables?: { [name: string]: any } When log message is created,
   values from log.variables are saved here (to make it possible to
   pass message between different processes)
   
See more details in [the type definition](../src/index.d.ts#L21) 
