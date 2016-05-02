'use strict';

const log = require('./index');

log.transports.file.file = __dirname + '/log.txt';

log.info(log.findLogPath());