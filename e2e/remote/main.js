'use strict';

const log = require('../..');
const startServer = require('./server');

log.transports.remote.url = 'http://localhost:7777/remote-log';
log.transports.remote.level = 'verbose';
log.transports.file.level = false;

async function main() {
  const server = await startServer(7777);

  log.info('Remote logging');
  await server.waitForRequest();

  log.info('🐛🐛 UTF8 🐛🐛');
  await server.waitForRequest();

  if (process.argv.indexOf('--test') !== -1) {
    await server.close();
    process.exit(0);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
