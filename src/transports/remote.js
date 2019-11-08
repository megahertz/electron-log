'use strict';

var http  = require('http');
var https = require('https');
var url   = require('url');

module.exports = remoteTransportFactory;

function remoteTransportFactory() {
  transport.client         = { name: 'electron-application' };
  transport.depth          = 6;
  transport.level          = false;
  transport.requestOptions = {};
  transport.url            = null;

  return transport;
}

function transport(msg) {
  if (!transport.url) return;

  var data = jsonDepth({
    client: transport.client,
    data: msg.data,
    date: msg.date.getTime(),
    level: msg.level,
    styles: msg.styles,
    variables: msg.variables
  }, transport.depth + 1);

  post(transport.url, data);
}

function post(serverUrl, data) {
  var urlObject = url.parse(serverUrl);
  var htTransport = urlObject.protocol === 'https:' ? https : http;

  var body = JSON.stringify(data);

  var options = {
    hostname: urlObject.hostname,
    port:     urlObject.port,
    path:     urlObject.path,
    method:   'POST',
    headers:  {
      'Content-Length': body.length,
      'Content-Type':   'application/json'
    }
  };

  Object.assign(options, transport.requestOptions);

  var request = htTransport.request(options);
  request.write(body);
  request.end();
}

function jsonDepth(json, depth) {
  if (depth < 1) {
    if (Array.isArray(json)) return '[array]';
    if (typeof json === 'object') return '[object]';

    return json;
  }

  if (Array.isArray(json)) {
    return json.map(function (child) {
      return jsonDepth(child, depth - 1);
    });
  }

  if (json && typeof json.getMonth === 'function') {
    return json;
  }

  if (json === null) {
    return null;
  }

  if (typeof json === 'object') {
    if (typeof json.toJSON === 'function') {
      json = json.toJSON();
    }

    var newJson = {};
    for (var i in json) {
      if (!Object.prototype.hasOwnProperty.call(json, i)) continue;
      newJson[i] = jsonDepth(json[i], depth - 1);
    }

    return newJson;
  }

  return json;
}
