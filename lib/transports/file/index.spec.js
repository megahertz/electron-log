'use strict';

var fs     = require('fs');
var os     = require('os');
var expect = require('chai').expect;
var index  = require('rewire')('./index');

//noinspection JSUnresolvedFunction
const getStreamSize  = index.__get__('getStreamSize');
//noinspection JSUnresolvedFunction
const archiveLog  = index.__get__('archiveLog');

describe('file transport', function() {
  var msg = {
    level: 'info',
    data: ['test'],
    date: new Date(2000, 0, 1, 1, 1, 1)
  };

  it('getStreamSize should return file size', function(done) {
    var log  = os.tmpdir() + '/temp.log';

    fs.writeFile(log, '7 bytes', function(err) {
      if (err) {
        return done(err);
      }

      var stream = fs.createWriteStream(log, { flags: 'a' });
      expect(getStreamSize(stream)).to.equals(7);

      stream.write('1', function() {
        expect(getStreamSize(stream)).to.equals(8);
        done();
      });
    });
  });
});
