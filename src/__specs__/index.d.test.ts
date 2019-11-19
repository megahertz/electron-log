import defaultLog from '../index';
import { create, FileTransport, warn } from '../index';

// Default module export
defaultLog.warn('test');

// CommonJS export
warn('test');

// Type export
let transport: FileTransport;

const newInstance = create('test');
newInstance.info('test');
