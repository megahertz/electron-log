import * as log from 'electron-log';

log.info('log from renderer');

if (window.location.href.includes('test=true')) {
  setTimeout(() => window.close(), 50);
}
