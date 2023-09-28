import { getUploadSignature } from 'src/backend/controllers/utils/MediaAPIs/BaseMediaAPI';
import MediaTypes from 'src/backend/shared/constants/MediaTypes';

jest.mock('aws-sdk');
jest.mock('src/backend/controllers/utils/MediaAPIs/initializeAPI');

describe('getUploadSignature', () => {
  it('gets the upload signature', async () => {
    const result = await getUploadSignature({
      id: 'id',
      params: { Bucket: '', Key: '', ContentType: MediaTypes.PNG, ACL: '' },
    });
    expect(result.signedRequest).toEqual('mock-signed-request/id');
    expect(result.mediaUrl).toEqual('mock-url/id');
  });
});
