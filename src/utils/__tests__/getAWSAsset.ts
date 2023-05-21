import getAWSAsset, { AWS_URL } from '../getAWSAsset';

describe('utils', () => {
  it('returns the AWS asset URI', () => {
    const path = '/icons/nkowaokwu.svg';
    expect(getAWSAsset(path)).toEqual(`${AWS_URL}${path}`);
  });
});
