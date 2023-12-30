'use strict';

// This is a workaround for node.js environment when Electron dependency isn't
// installed.

let electronIsAvailable = false;

try {
  // eslint-disable-next-line global-require
  require('electron');
  electronIsAvailable = true;
} catch {
  // No Electron installed
}

if (!electronIsAvailable) {
  try {
    require.cache.electron = { exports: {} };
  } catch {
    // Looks like there is no other way to provide support for node.js app
    // without Electron installed.
  }
}
