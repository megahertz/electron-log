'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 15000;

describe('test:projects', function () {
  it('ipc: check log files', function () {
    return helper.run('ipc', TIMEOUT).then(function (logReader) {
      expect(logReader.format()).toEqual([
        'main.log: { name: \'Log object in renderer\' }',
        [
          'main.log: function functionInRenderer() {',
          '    return 1;',
          '  }',
        ].join('\n'),
        jasmine.stringMatching('main.log: Error: Error in renderer\n    at'),
        'renderer.log: { name: \'Log object in main\' }',
        [
          'renderer.log: function functionInMain() {',
          '      return 1;',
          '    }',
        ].join('\n'),
        jasmine.stringMatching('renderer.log: Error: Error in main\n    at'),
      ]);
    });
  }, TIMEOUT);
});
