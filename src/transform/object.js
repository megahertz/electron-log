'use strict';

var util = require('util');

module.exports = {
  maxDepthFactory: maxDepthFactory,
  serialize: serialize,
  toJSON: toJSON,
  toStringFactory: toStringFactory,
};

/**
 * @param {object} options?
 * @param {boolean} options.serializeMapAndSet?
 * @return {function}
 */
function createSerializer(options) {
  var seen = createWeakSet();

  return function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined;
      }

      seen.add(value);
    }

    return serialize(key, value, options);
  };
}

/**
 * @return {WeakSet<object>}
 */
function createWeakSet() {
  if (typeof WeakSet !== 'undefined') {
    return new WeakSet();
  }

  var cache = [];
  return {
    add: function (value) { cache.push(value) },
    has: function (value) { return cache.indexOf(value) !== -1 },
  };
}

function maxDepth(data, depth) {
  if (!data) {
    return data;
  }

  if (depth < 1) {
    if (isArray(data)) return '[array]';
    if (typeof data === 'object' && data) return '[object]';

    return data;
  }

  if (isArray(data)) {
    return data.map(function (child) {
      return maxDepth(child, depth - 1);
    });
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (data && typeof data.toISOString === 'function') {
    return data;
  }

  // noinspection PointlessBooleanExpressionJS
  if (data === null) {
    return null;
  }

  if (data instanceof Error) {
    return data;
  }

  var newJson = {};
  for (var i in data) {
    if (!Object.prototype.hasOwnProperty.call(data, i)) continue;
    newJson[i] = maxDepth(data[i], depth - 1);
  }

  return newJson;
}

function maxDepthFactory(depth) {
  depth = depth || 6;

  return function maxDepthFunction(data) {
    return maxDepth(data, depth);
  };
}

/**
 * @param {string} key
 * @param {any} value
 * @param {object} options?
 * @return {any}
 */
function serialize(key, value, options) {
  var serializeMapAndSet = !options || options.serializeMapAndSet !== false;

  if (value instanceof Error) {
    return value.stack;
  }

  if (!value) {
    return value;
  }

  if (typeof value.toJSON === 'function') {
    return value.toJSON();
  }

  if (typeof value === 'function') {
    return '[function] ' + value.toString();
  }

  if (serializeMapAndSet && value instanceof Map && Object.fromEntries) {
    return Object.fromEntries(value);
  }

  if (serializeMapAndSet && value instanceof Set && Array.from) {
    return Array.from(value);
  }

  return value;
}

function toJSON(data) {
  return JSON.parse(JSON.stringify(data, createSerializer()));
}

function toStringFactory(inspectOptions) {
  return function toStringFunction(data) {
    var simplifiedData = data.map(function (item) {
      if (item === undefined) {
        return undefined;
      }

      try {
        var str = JSON.stringify(item, createSerializer(), '  ');
        return str === undefined ? undefined : JSON.parse(str);
      } catch (e) {
        // There are some rare cases when an item can't be simplified.
        // In that case, it's fine to pass it to util.format directly.
        return item;
      }
    });

    if (util.formatWithOptions) {
      simplifiedData.unshift(inspectOptions || {});
      return util.formatWithOptions.apply(util, simplifiedData);
    }

    return util.format.apply(util, simplifiedData);
  };
}

function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}
