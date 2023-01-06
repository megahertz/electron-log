'use strict';

const { contextBridge } = require('electron');
require('../../src/renderer/preload');
const log = require('../..');

contextBridge.exposeInMainWorld('log', log.functions);
