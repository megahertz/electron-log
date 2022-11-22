'use strict';

const http = require('http');
const log = require('../..');

module.exports = startServer;

const logger = log.create('server');
logger.transports.file.fileName = 'server.log';

async function startServer(port) {
  let onSuccessRequest;
  let onFailureRequest;

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      readPostData(req)
        .then((data) => {
          logger.info('Request:', data.data[0]);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));

          if (typeof onSuccessRequest === 'function') {
            onSuccessRequest(makeServerInterface());
          }
        })
        .catch((e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: e }));

          if (typeof onFailureRequest === 'function') {
            onFailureRequest(e);
          }
        });
    });

    server.listen(port, () => {
      resolve(makeServerInterface());
    });

    server.on('error', reject);

    function makeServerInterface() {
      return {
        instance: server,
        close() {
          return new Promise((resolveClose) => {
            server.close(resolveClose);
          });
        },
        waitForRequest() {
          return new Promise((requestResolve, requestReject) => {
            onSuccessRequest = requestResolve;
            onFailureRequest = requestReject;
          });
        },
      };
    }
  });
}

async function readPostData(req) {
  return new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      reject(new Error('POST method required'));
    }

    const chunks = [];

    req
      .on('data', (data) => { chunks.push(data) })
      .on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(
            new Error(`Cannot read body: ${e.message}\nReceived: ${body}`),
          );
        }
      })
      .on('error', reject);
  });
}
