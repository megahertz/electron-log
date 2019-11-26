'use strict';

module.exports = {
  applyAnsiStyles: applyAnsiStyles,
  removeStyles: removeStyles,
  transformStyles: transformStyles,
};

var ANSI_COLORS = {
  unset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function applyAnsiStyles(data) {
  return transformStyles(data, styleToAnsi, resetAnsiStyle);
}

function styleToAnsi(style) {
  var color = style.replace(/color:\s*(\w+).*/, '$1').toLowerCase();
  return ANSI_COLORS[color] || '';
}

function resetAnsiStyle(string) {
  return string + ANSI_COLORS.unset;
}

function removeStyles(data) {
  return transformStyles(data, function () { return '' });
}

function transformStyles(data, onStyleFound, onStyleApplied) {
  var skipNext = 0;

  return data.reduce(function (result, item, index, array) {
    if (skipNext > 0) {
      skipNext -= 1;
      return result;
    }

    if (typeof item === 'string') {
      item = item.replace(/%c/g, function (match) {
        skipNext += 1;
        var style = array[index + skipNext];
        if (style) {
          return onStyleFound(style, item);
        }

        return match;
      });

      if (skipNext > 0 && onStyleApplied) {
        item = onStyleApplied(item);
      }
    }

    result.push(item);
    return result;
  }, []);
}
