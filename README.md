# electron-log

## Description

Just a very simple logging module for your Electron application.
No dependencies. No complicated configuration. Just require and use.

By default, writes logs on the following locations:

 * **on Linux:** ~/.cache/<app name>/log.log
 * **on OS X:** ~/Library/Caches/<app name>/log.log
 * **on Windows:** $HOME/AppData/Roaming/<app name>/log.log

## Installation

Install with [npm](https://npmjs.org/package/comments-parser):

    npm install electron-log

## Usage

    javascript
    var log = require('electron-log');
    
    log.info('Hello, log');
    

### Transport
Transport is a simple function which requires an object which describes a message.
By default, two transports is active: console and file. The file path is 
depend on current platform.

#### Disable default transport:

    log.transport.file = false;
    log.transport.console = false;
    
#### Override transport:

    log.transports.console = function(msg) {
      console.log(`[${msg.date.toLocaleTimeString()} ${msg.level}] ${msg.text}`);
    };
    
#### Console Transport

    // Log level
    log.transports.console.level = 'warning';
    
    /** 
     * Set output format template. Available variables:
     * Main: {level}, {text}
     * Date: {y},{m},{d},{h},{i},{s},{ms}
     */
    log.transports.console.format = '{h}:{i}:{s}:{ms} {text}';
    
    // Set a function which formats output
    log.transports.console.format = (msg) => msg.text;
    
#### File transport

    // Same as for console transport
    log.transports.file.level = 'warning';
    log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';
    
    // Write to this file, must be set before first logging
    log.transports.file.file = __dirname + '/log.txt';
    
    // fs.createWriteStream options, must be set before first logging
    log.transports.file.streamConfig = { flags: 'w' };
    
    // set existed file stream
    log.transports.file.stream = fs.createWriteStream('log.txt');

## License

Licensed under MIT.
