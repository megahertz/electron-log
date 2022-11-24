# Catching errors

electron-log can be used to collect all unhandled errors/rejections

#### `log.errorHandler.startCatching(options?)`

Start catching

#### `log.errorHandler.stopCatching()`

Stop error catching

#### `log.errorHandler.handle(error, options?)`

Process an error. Works even if catching isn't started.

## Options
   
#### `includeRenderer` {boolean}

Catch errors from renderer processes

Default: `true`

#### `showDialog` {boolean}

Default: `true` 

It follows Electron logic for error handling, so the dialog is
shown only when error is thrown in the main process. Errors from a renderer
process and any rejected promises are ignored. Settings it to false disables
error dialog for any error.
   
#### `onError(error, [versions, submitIssue]) => void | false`
   
Default: `null`

Attach a custom error handler. If the handler returns false, this error will
not be processed.

`error: Error` - handled error

`version: { app: string, electron: string, os: string }` - Version information
which could be useful for an error report

`createIssue(url, queryParams)` Open the url with query params appended in a
browser
   
## Github issue example   
   
```js
log.errorHandler.startCatching({
  showDialog: false,
  onError({ error, versions, createIssue }) {
    electron.dialog.showMessageBox({
      title: 'An error occurred',
      message: error.message,
      detail: error.stack,
      type: 'error',
      buttons: ['Ignore', 'Report', 'Exit'],
    })
      .then((result) => {
        if (result.response === 1) {
          createIssue('https://github.com/my-acc/my-app/issues/new', {
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
```
