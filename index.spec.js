/* jshint -W030 */
'use strict';

const expect = require('chai').expect;
const index  = require('rewire')('.');

const format        = index.__get__('format');
const formatConsole = index.__get__('formatConsole');
const formatFile    = index.__get__('formatFile');
const pad           = index.__get__('pad');
const compareLevels = index.__get__('compareLevels');


describe('module', () => {
  it('should contains npm level methods', () => {
    const log = requireLog();
    const levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

    for (let level of levels) {
      expect(log[level]).to.be.a('function');
    }
  });
});

describe('log()', () => {
  it('should call a transport protocol', () => {
    const log = requireLog();
    const journal = [];
    const testMsg = {
      level: 'info',
      text:  'test'
    };

    log.transports = {
      variable: (msg) => journal.push(msg)
    };

    log.info(testMsg.text);

    expect(journal[0].text).to.equal(testMsg.text);
    expect(journal[0].level).to.equal(testMsg.level);
  });
});

describe('format', () => {
  const msg = {
    level: 'info',
    text: 'test',
    date: new Date(2000, 1, 1, 1, 1, 1)
  };

  it('should call formatter if it\'s a function', () => {
    let called = false;

    format(msg, () => called = true);
    expect(called).to.be.true;
  });

  it('should format by template', () => {
    const text = format(msg, '{y}:{m}:{d} {h}:{i}:{s}:{ms} {level} {text}');
    expect(text).to.equal('2000:01:01 01:01:01:0000 info test');
  });
  
  it('should format console output', () => {
    expect(formatConsole(msg)).to.equals('[01:01:01:0000] [info] test');
  });

  it('should format file output', () => {
    expect(formatFile(msg)).to.equals('[2000-01-01 01:01:01:0000] [info] test');
  });
  
  it('should par numeric', () => {
    expect(pad(1, 1)).to.equals('1');
    expect(pad(1)).to.equals('01');
    expect(pad(10, 4)).to.equals('0010');
  });
});

describe('compareLevels', () => {
  expect(compareLevels('error', 'info')).to.be.false;
  expect(compareLevels('info', 'error')).to.be.true;
  expect(compareLevels('error', 'error')).to.be.true;
  expect(compareLevels('error', 'not_exists')).to.be.true;
});

function requireLog() {
  delete require.cache[require.resolve('./index')];
  return require('./index');
}