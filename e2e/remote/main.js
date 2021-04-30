'use strict';

var log = require('../..');
var startServer = require('./server');

var IS_TEST = process.argv.indexOf('--test') !== -1;

log.transports.remote.url = 'http://localhost:7777/remote-log';
log.transports.remote.level = 'verbose';
log.transports.file.level = false;
// log.transports.console.level = false;

function main() {
  return startServer(7777)
    .then(function (server) {
      log.info('Remote logging');
      return server.waitForRequest();
    })
    .then(function (server) {
      log.info('🐛🐛 UTF8 🐛🐛');
      return server.waitForRequest();
    })
    .then(function (server) {
      if (IS_TEST) {
        return server.close();
      }

      return server;
    })
    .then(function () {
      if (IS_TEST) {
        process.exit(0);
      }
    });
}

main().catch(function (e) {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
