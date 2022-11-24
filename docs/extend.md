# Extending electron-log

Each process in Electron has its own electron-log instance, so make sure you define a custom transport or hook in each process. It's a good idea to save such a code in a separated file and require it from inside each process.

## Transport

Transport is just a function `(msg: LogMessage) => void`, so you can
easily override/add your own transport.

```js
import util from 'util';

log.transports.console = (message) => {
  const text = util.format.apply(util, message.data);
  console.log(`[${message.date.toLocaleTimeString()} ${message.level}] ${text}`);
};
```

Please be aware, if you override a transport function the default
transport options (like level or format) will be undefined.

### transforms

Each transport has a `transform` option which is an array of functions. Before
doing some work, a log message is passed through each transform function to 
format `data` before processing.

A transform has the following interface:

```typescript
({ data, message, logger, transport }) => any;
```

It returns a message `data` property with some transformations applied.

Example of adding a custom transform function

```js
log.transports.file.transforms.push(({ data }) => {
  if (data.includes('paynment')) {
    return ['[PAYNMENT]', ...data];
  }
  
  return data;
});
```

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

## Log levels

Add a new "notice" level before "info" (index = 2):

```js
log.addLevel('notice', 2);
log.notice('New level added');
```

Also, you can add TypeScript type definition:

*electron-log.extend.d.ts:*
```typescript
import 'electron-log'

declare module 'electron-log' {
  interface LogFunctions {
    notice(...params: any[]): void;
  }
}

```

## LogMessage

 - data: any[] Arguments passed to log function
 - date: Date
 - level: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'
 - logId: string
 - scope: string | undefined
 - variables?: { [name: string]: any } When log message is created,
   values from `log.variables` are saved here (to make it possible to
   pass message between different processes)
   
See more details in [the type definition](../src/index.d.ts#L33) 
