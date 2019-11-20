# Format

Format property can be a string template or a function

## Template

Example: ``'[{h}:{i}:{s}.{ms}] [{level}] {text}'``

| Name        | Value                  |
|-------------|------------------------|
| level       | Logging level          |
| text        | Serialized log message |
| processType | browser or renderer    |
| y           | Year                   |
| m           | Month                  |
| d           | Day                    |
| h           | Hour                   |
| i           | Minute                 |
| s           | Second                 |
| ms          | Millisecond            |
| z           | Timezone offset        |
| iso         | date.toISOString()     |

Also, you can use your own values:

```js
log.variables.label = 'dev';
log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{label}] {text}';
```

## Function

`(message: LogMessage) => string`

```js
log.transports.console.format = (message) => {
  return util.format.apply(util, message.data);
}
```
