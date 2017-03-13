'use strict';

var expect = require('chai').expect;
var getAppName  = require('./get-app-name');

describe('file transport', function() {
  describe('getAppName', function () {
    it('should return package name by reading package.json', function () {
      expect(getAppName()).to.equals(
        'mocha',
        'It has to load a mocha package, because it\'s an entry point'
      );
    });
  });
});