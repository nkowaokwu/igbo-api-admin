import { determineDate } from '../utils';

describe('Utils for shows', () => {
  it('determines the date', () => {
    const date = '2023-02-02';

    expect(determineDate(date)).toEqual(new Date(date).toLocaleString());
  });

  it('returns N/A with falsy date', () => {
    const date = '';

    expect(determineDate(date)).toEqual('N/A');
  });
});
