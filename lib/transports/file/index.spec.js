'use strict';

var fs     = require('fs');
var os     = require('os');
var expect = require('chai').expect;
var index  = require('rewire')('./index');

//noinspection JSUnresolvedFunction
const formatFile = index.__get__('formatFn');
//noinspection JSUnresolvedFunction
const logRotate  = index.__get__('logRotate');

describe('file transport', function() {
  var msg = {
    level: 'info',
    data: ['test'],
    date: new Date(2000, 0, 1, 1, 1, 1)
  };

  it('should format file output', function() {
    expect(formatFile(msg)).to.equals('[2000-01-01 01:01:01:0000] [info] test');
  });
});

describe('logRotate', function () {
  var log    = os.tmpdir() + '/temp.log';
  var oldLog = os.tmpdir() + '/temp.old.log';

  beforeEach(function(done) {
    fs.unlink(oldLog, function() { done(); });
  });

  it('should move to a new path if size exceeds maxSize', function(done) {
    fs.writeFile(log, '7 bytes', function(err) {
      if (err) {
        return done(err);
      }
      logRotate(log, 5);
      fs.stat(oldLog, function(e) { done(e); });
    });
  });

  it('should do nothing if size not exceeds maxSize', function(done) {
    fs.writeFile(log, '7 bytes', function(err) {
      if (err) {
        return done(err);
      }
      logRotate(log, 10);
      fs.stat(oldLog, function(e) {
        if (e) {
          done();
        } else {
          done('Log is rotated when its size is not exceeds maxSize');
        }
      });
    });
  });
});