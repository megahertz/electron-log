'use strict';

const NullFile = require('../NullFile');

describe('NullFile', () => {
  it('should not perform file operations', () => {
    const nullFile = new NullFile({ path: '/not-exists/1.txt' });

    nullFile.writeLine('test');
    expect(nullFile.size).toBe(0);
  });
});
