'use strict';

var expect = require('chai').expect;
var util   = require('util');
var format = require('./format');

describe('format', function () {
  var msg = {
    level: 'info',
    data: ['test'],
    date: new Date(2000, 0, 1, 1, 1, 1),
    variables: { myVar: 'myVarValue' }
  };

  it('should call formatter if it\'s a function', function () {
    var called = false;
    format.format(msg, function () { called = true });
    expect(called).to.be.true;
  });

  it('should format by template', function () {
    var text = format.format(
      msg,
      '{y}:{m}:{d} {h}:{i}:{s}:{ms} {level} {text}'
    );
    expect(text).to.equal('2000:01:01 01:01:01:000 info test');
  });

  it('should format timezone offset', function () {
    expect(format.formatTimeZone(-60)).to.equal('+01:00');
    expect(format.formatTimeZone(60)).to.equal('-01:00');
    expect(format.formatTimeZone(-570)).to.equal('+09:30');
  });

  it('should pad numeric', function () {
    expect(format.pad(1, 1)).to.equals('1');
    expect(format.pad(1)).to.equals('01');
    expect(format.pad(10, 3)).to.equals('010');
  });

  it('should allow to use custom variables', function () {
    var text = format.format(msg, '{myVar} {level} {text}');

    expect(text).to.equal('myVarValue info test');
  });

  it('should resolve getters', function () {
    if (!util.formatWithOptions) {
      // node version < 10
      return;
    }

    var message = Object.assign({}, msg, {
      data: [{
        get value() {
          return 'test';
        }
      }]
    });

    var text = format.format(message, '{text}');
    expect(text).to.equal('{ value: [Getter: \'test\'] }');
  });
});
