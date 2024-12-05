'use strict';

const { expect } = require('humile');
const Logger = require('../Logger');

describe('Buffering', () => {
  it('should write messages when commit is called', () => {
    const { log, written } = createLogger();

    log.info('before');

    log.buffering.begin();
    log.info('buffered');
    expect(written).toEqual(['before']);

    log.buffering.commit();
    log.info('after');
    expect(written).toEqual(['before', 'buffered', 'after']);
  });

  it('should discard messages when reject is called', () => {
    const { log, written } = createLogger();

    log.info('before');

    log.buffering.begin();
    log.info('buffered');
    expect(written).toEqual(['before']);

    log.buffering.reject();
    log.info('after');
    expect(written).toEqual(['before', 'after']);
  });
});

function createLogger() {
  const written = [];

  function variableWriteFactory() {
    return (msg) => {
      written.push(msg.data.join(' '));
    };
  }

  return {
    log: new Logger({ transportFactories: [variableWriteFactory] }),
    written,
  };
}
