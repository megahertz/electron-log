'use strict';

const { transform } = require('../transform');

describe('transform/transform', () => {
  it('passes the data through each transform', () => {
    const transformed = transform({
      message: { data: ['test'] },
      transforms: [({ data }) => [...data, 1]],
    });

    expect(transformed).toEqual(['test', 1]);
  });
});
