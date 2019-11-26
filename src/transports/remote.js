'use strict';

var http = require('http');
var https = require('https');
var url = require('url');
var transform = require('../transform');

module.exports = remoteTransportFactory;

function remoteTransportFactory() {
  transport.client = { name: 'electron-application' };
  transport.depth = 6;
  transport.level = false;
  transport.requestOptions = {};
  transport.url = null;

  return transport;
}

function transport(message) {
  if (!transport.url) return;

  post(transport.url, {
    client: transport.client,
    data: transform.transform(message, [
      transform.removeStyles,
      transform.toJSON,
      transform.maxDepthFactory(transport.depth + 1),
    ]),
    date: message.date.getTime(),
    level: message.level,
    styles: message.styles,
    variables: message.variables,
  });
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
      'Content-Type':   'application/json',
    },
  };

  Object.assign(options, transport.requestOptions);

  var request = htTransport.request(options);
  request.write(body);
  request.end();
}
