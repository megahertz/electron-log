import defaultLog from '../../main';
import { ConsoleTransport, warn } from '../index';

// Default module export
defaultLog.warn('test');

// Check whether default logger is MainLogger
defaultLog.create({ logId: 'test '}).transports.file.level = 'error';

// CommonJS export
warn('test');

// Check named export
const transport: ConsoleTransport = defaultLog.transports.console
transport({ data: [], date: new Date(), level: 'info' })
