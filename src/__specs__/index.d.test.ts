import defaultLog from '../index';
import { create, ConsoleTransport, warn } from '../index';

// Default module export
defaultLog.warn('test');

// CommonJS export
warn('test');

// Type export
const transport: ConsoleTransport = defaultLog.transports.console
transport({ data: [], date: new Date(), level: 'info' })

const newInstance = create({ logId: 'test' });
newInstance.info('test');

__electronLog.info();
