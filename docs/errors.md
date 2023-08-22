# Catching errors

electron-log can be used to collect all unhandled errors/rejections

To initialize catching, call the `log.errorHandler.startCatching` method. It
should be done in both main and renderer processes if you want to collect logs
on both sides.

#### `log.errorHandler.startCatching(options?)`

Start catching

#### `log.errorHandler.stopCatching()`

Stop error catching

#### `log.errorHandler.handle(error, options?)`

Process an error. Works even if catching isn't started.

## Options

#### `showDialog` {boolean}

Default: `true` 

It follows Electron logic for error handling, so the dialog is
shown only when error is thrown in the main process. Errors from a renderer
process and any rejected promises are ignored. Settings it to false disables
error dialog for any error.
   
#### `onError({ createIssue, error, processType, versions }) => void | false`
   
Default: `null`

Attach a custom error handler. If the handler returns false, this error will
not be processed. In a renderer process only the `error` property available.

`createIssue(url, queryParams)` Open the url with query params appended in a
browser

`error: Error` - handled error

`processType: 'browser' | 'renderer`

`version: { app: string, electron: string, os: string }` - Version information
which could be useful for an error report


   
## Github issue example   
   
```js
log.errorHandler.startCatching({
  showDialog: false,
  onError({ createIssue, error, processType, versions }) {
    if (processType === 'renderer') {
      return;
    }
    
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
