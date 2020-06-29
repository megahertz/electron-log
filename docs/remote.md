# Remote transport

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

#### `requestOptions` {module:http.RequestOptions}

Default: `{}`

Customize options used by
[`http.request()`](https://nodejs.org/api/http.html#http_http_request_options_callback)
    
#### **`transformBody`** {(data: LogMessage & { client: object }) => string}

Default: `data => JSON.stringify(data)`

Callback which transforms request body to string

#### `errorTransports` [array]

Default: `null` (sending to console, ipc and file)

If the network request fails, electron-log will log the error message to specified transports. By default the
error messages are also logged to file, however it is recommended to disable file logging on devices with
low disc speed as it would double the disc writes if the device is behind a firewall or not connected to the Internet.

#### **`url`** {string}

Default: `undefined`

Endpoint URL.
