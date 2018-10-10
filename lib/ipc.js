'use strict';

module.exports.pack = pack;

function pack(data) {
  if (typeof data === 'function') {
    return data.toString();
  }

  if (data instanceof Error) {
    return data.stack;
  }

  return data;
}
