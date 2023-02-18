'use strict';

const { contextBridge } = require('electron');
require('../../src/renderer/electron-log-preload');
const log = require('../..');

contextBridge.exposeInMainWorld('log', log.functions);
