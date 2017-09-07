'use strict';

const expect = require('chai').expect;
const helper = require('../spec-helper');

const APP_NAME = 'electron-log-test-simple';

describe('simple test project', function() {
  this.timeout(5000);

  it('should write one line to a log file', () => {
    return helper.run(APP_NAME).then((logs) => {
      expect(logs.length).to.equal(4);
      expect(logs[0]).to.match(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from the main process/
      );
      expect(logs[1]).to.match(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from a renderer process/
      );
      expect(logs[2]).to.match(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from the second renderer process/
      );
    });
  })
});
