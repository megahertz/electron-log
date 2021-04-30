'use strict';

var http = require('http');
var log = require('../..');

module.exports = startServer;

var logger = log.create('server');
logger.transports.file.fileName = 'server.log';

function startServer(port) {
  var onSuccessRequest;
  var onFailureRequest;

  return new Promise(function (resolve, reject) {
    var server = http.createServer(function (req, res) {
      readPostData(req)
        .then(function (data) {
          logger.info('Request:', data.data[0]);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));

          if (typeof onSuccessRequest === 'function') {
            onSuccessRequest(makeServerInterface());
          }
        })
        .catch(function (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: e }));

          if (typeof onFailureRequest === 'function') {
            onFailureRequest(e);
          }
        });
    });

    server.listen(port, function () {
      resolve(makeServerInterface());
    });

    server.on('error', reject);

    function makeServerInterface() {
      return {
        instance: server,
        close: function () {
          return new Promise(function (resolveClose) {
            server.close(resolveClose);
          });
        },
        waitForRequest: function () {
          return new Promise(function (requestResolve, requestReject) {
            onSuccessRequest = requestResolve;
            onFailureRequest = requestReject;
          });
        },
      };
    }
  });
}

function readPostData(req) {
  return new Promise(function (resolve, reject) {
    if (req.method !== 'POST') {
      reject(new Error('POST method required'));
    }

    var chunks = [];

    req
      .on('data', function (data) { chunks.push(data) })
      .on('end', function () {
        var body = Buffer.concat(chunks).toString('utf8');
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(
            new Error('Cannot read body: ' + e.message + '\nReceived: ' + body)
          );
        }
      })
      .on('error', reject);
  });
}
