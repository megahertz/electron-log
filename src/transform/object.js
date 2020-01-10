'use strict';

var util = require('util');

module.exports = {
  maxDepthFactory: maxDepthFactory,
  serialize: serialize,
  toJSON: toJSON,
  toString: toString,
};

function maxDepth(data, depth) {
  if (!data) {
    return data;
  }

  if (depth < 1) {
    if (data.map) return '[array]';
    if (typeof data === 'object') return '[object]';

    return data;
  }

  if (typeof data.map === 'function') {
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

function serialize(key, value) {
  if (value instanceof Error) {
    var object = Object.assign(
      {
        constructor: (value.constructor && value.constructor.name) || 'Error',
      },
      value,
      { stack: value.stack }
    );

    if (!object.stack) {
      object.message = value.message;
    }

    if (value.constructor && value.constructor.name) {
      object.constructor = value.constructor.name;
    }

    return object;
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

  return value;
}

function toJSON(data) {
  return JSON.parse(JSON.stringify(data, serialize));
}

function toString(data) {
  var simplifiedData = data.map(function (item) {
    if (item === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(item, serialize, '  '));
  });

  return util.format.apply(util, simplifiedData);
}
