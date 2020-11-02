#!/usr/bin/env node

'use strict';

var nodeVersion = parseFloat(process.version.replace('v', ''));
var requiredVersion = parseFloat(process.argv[2]);

process.exit(nodeVersion >= requiredVersion ? 0 : 1);
