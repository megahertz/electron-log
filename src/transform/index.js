'use strict';

var object = require('./object');
var style = require('./style');
var template = require('./template');

module.exports = {
  applyAnsiStyles: style.applyAnsiStyles,
  customFormatterFactory: customFormatterFactory,
  maxDepthFactory: object.maxDepthFactory,
  removeStyles: style.removeStyles,
  toJSON: object.toJSON,
  toString: object.toString,
  transform: transform,
};

function customFormatterFactory(customFormat) {
  if (typeof customFormat === 'string') {
    return function customStringFormatter(data, message) {
      return transform(message, [
        template.templateVariables,
        template.templateDate,
        template.templateText,
      ], [customFormat].concat(data));
    };
  }

  if (typeof customFormat === 'function') {
    return function customFunctionFormatter(data, message) {
      var modifiedMessage = Object.assign({}, message, { data: data });
      var texts = customFormat(modifiedMessage, data);
      return [].concat(texts);
    };
  }

  return function (data) {
    return data;
  };
}

function transform(message, transformers, initialData) {
  return transformers.reduce(function (data, transformer) {
    return transformer(data, message);
  }, initialData || message.data);
}
