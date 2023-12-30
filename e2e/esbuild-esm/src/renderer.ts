import log from 'electron-log/renderer';

log.info('log from renderer');

if (window.location.href.includes('test=true')) {
  setTimeout(() => window.close(), 50);
}
