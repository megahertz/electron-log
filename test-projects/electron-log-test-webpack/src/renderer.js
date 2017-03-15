import { remote } from 'electron';
import log from 'electron-log';

const proc = remote.process;

log.warn('log from a renderer process');

if (proc.argv.indexOf('--test') !== -1) {
  remote.process.exit(0);
}