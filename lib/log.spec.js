// jshint -W030
'use strict';

var expect = require('chai').expect;
var log    = require('./log');

var logModule  = require('rewire')('./log');
//noinspection JSUnresolvedFunction
var compareLevels  = logModule.__get__('compareLevels');
var getLabel = function() { return 'test-label'; };

describe('log', function() {
  it('should call a transport protocol', function() {
    var journal = [];

    //noinspection JSUnusedGlobalSymbols
    var transports = {
      variable: function (msg) { journal.push(msg); }
    };

    //noinspection JSUnresolvedFunction
    log(transports, 'info', getLabel, 'test');

    expect(journal[0].data).to.deep.equal(['test']);
    expect(journal[0].level).to.equal('info');
    expect(journal[0].label).to.equal('test-label');
  });


  it('should be compared', function () {
    expect(compareLevels('error', 'info')).to.be.false;
    expect(compareLevels('info', 'error')).to.be.true;
    expect(compareLevels('error', 'error')).to.be.true;
    expect(compareLevels('error', 'not_exists')).to.be.true;
  });
});