'use strict';

/**
 * Save console methods for using when originals are overridden
 */
module.exports = {
  context: console,
  error:   console.error,
  warn:    console.warn,
  info:    console.info,
  verbose: console.verbose,
  debug:   console.debug,
  silly:   console.silly,
  log:     console.log
};
