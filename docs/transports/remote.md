# Remote transport (main process only)

Sends a JSON POST request with `LogMessage` in the body to the specified url.

```js
log.transports.remote.level = 'warn';
log.transports.remote.url = 'https://example.com/myapp/add-log'
log.warn('Some problem appears', { error: e });
```

The code above produces the following HTTP request (json is formatted
for clarity in the example):

```
POST /myapp/add-log HTTP/1.1
Content-Length: 300
Content-Type: application/json
Host: example.com
Connection: close

{
  "client": { "name": "electron-application" },
  "data": [
    "Some problem appears",
    { 
      "error": {
        "constructor": "Error",
        "stack": "Error: test\n    at App.createWindow ..."
      }
    }
  ],
  "date": 1574238042989,
  "level": "warn",
  "variables": { "processType": "browser" }
}
```

## Options

#### `client` {object}

Default: `{ name: 'electron-application' }`

It's just an additional field which will be appended to JSON body for each
request.

#### `depth` {object}

Default: `6`

Sometimes logging very complex object can produce a huge POST body. To reduce
request size set depth option to exclude nested objects which are deeper than
`depth`.

#### `level` {LogLevel | false}

Default: `false`

Filter log messages which can be sent via the transport.

#### `makeBodyFn` {({ logger, message, transport }) => string}

A callback which makes a POST body from a message

#### `processErrorFn` {({ error, logger, message, request, transport }) => void}

A callback called on request error

#### `requestOptions` {module:http.RequestOptions}

Default: `{}`

Customize options used by
[`http.request()`](https://nodejs.org/api/http.html#http_http_request_options_callback)

#### **`url`** {string}

Default: `undefined`

Endpoint URL.
