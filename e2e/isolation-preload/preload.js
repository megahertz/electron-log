'use strict';

const { contextBridge } = require('electron');
const log = require('../..');

contextBridge.exposeInMainWorld('log', log.functions);
