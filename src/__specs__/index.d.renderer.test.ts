import defaultLog from '../../renderer';
import { warn } from '../index';

// Default module export
defaultLog.warn('test');

// CommonJS export
warn('test');

// Check global variable
__electronLog.info();
