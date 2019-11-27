'use strict';

var object = require('./object');

module.exports = {
  formatDate: formatDate,
  formatTimeZone: formatTimeZone,
  pad: pad,
  templateDate: templateDate,
  templateVariables: templateVariables,
  templateText: templateText,
};

function formatDate(template, date) {
  return template
    .replace('{y}', String(date.getFullYear()))
    .replace('{m}', pad(date.getMonth() + 1))
    .replace('{d}', pad(date.getDate()))
    .replace('{h}', pad(date.getHours()))
    .replace('{i}', pad(date.getMinutes()))
    .replace('{s}', pad(date.getSeconds()))
    .replace('{ms}', pad(date.getMilliseconds(), 3))
    .replace('{z}', formatTimeZone(date.getTimezoneOffset()))
    .replace('{iso}', date.toISOString());
}

function formatTimeZone(minutesOffset) {
  var m = Math.abs(minutesOffset);
  return (minutesOffset >= 0 ? '-' : '+')
    + pad(Math.floor(m / 60)) + ':'
    + pad(m % 60);
}

function pad(number, zeros) {
  zeros = zeros || 2;
  return (new Array(zeros + 1).join('0') + number).substr(-zeros, zeros);
}

function templateDate(data, message) {
  var template = data[0];
  if (typeof template !== 'string') {
    return data;
  }

  data[0] = formatDate(template, message.date);
  return data;
}

function templateVariables(data, message) {
  var template = data[0];
  var variables = message.variables;

  if (typeof template !== 'string' || !message.variables) {
    return data;
  }

  for (var i in variables) {
    if (!Object.prototype.hasOwnProperty.call(variables, i)) continue;
    template = template.replace('{' + i + '}', variables[i]);
  }

  template = template.replace('{level}', message.level);

  data[0] = template;
  return data;
}

function templateText(data) {
  var template = data[0];
  if (typeof template !== 'string') {
    return data;
  }

  var textTplPosition = template.lastIndexOf('{text}');
  if (textTplPosition === template.length - 6) {
    data[0] = template.replace(/\s?{text}/, '');
    return data;
  }

  return [
    template.replace('{text}', object.toString(data.slice(1))),
  ];
}
