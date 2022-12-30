'use strict';

if (typeof electronLog === 'object') {
  // eslint-disable-next-line no-undef
  module.exports = electronLog;
} else {
  throw new Error(
    'electron-log isn\'t initialized in the main process. '
    + 'Call log.initialize() in the top of your main process entrypoint.',
  );
}
