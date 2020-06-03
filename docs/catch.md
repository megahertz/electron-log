# Catch errors

#### `log.catchErrors([options])`

Catch and log unhandled errors/rejected promises

## Options
   
#### `showDialog` {boolean}

Default: `true` in main, `false` in renderer

False prevents showing a default Electron error dialog.
   
#### `onError(error, [versions, submitIssue]) => void | false`
   
Default: `null`

Attach a custom error handler. If the handler returns false, this error will
not be processed.

`error: Error` - handled error

`version: { app: string, electron: string, os: string }` - Version information
which could be useful for an error report

`submitIssue(url, queryParams)` Open the url with query params appended in a
browser
   
## Github issue example   
   
```js
log.catchErrors({
  showDialog: false,
  onError(error, versions, submitIssue) {
    electron.dialog.showMessageBox({
      title: 'An error occurred',
      message: error.message,
      detail: error.stack,
      type: 'error',
      buttons: ['Ignore', 'Report', 'Exit'],
    })
      .then((result) => {
        if (result.response === 1) {
          submitIssue('https://github.com/my-acc/my-app/issues/new', {
            title: `Error report for ${versions.app}`,
            body: 'Error:\n```' + error.stack + '\n```\n' + `OS: ${versions.os}`
          });
          return;
        }
      
        if (result.response === 2) {
          electron.app.quit();
        }
      });
  }
});

