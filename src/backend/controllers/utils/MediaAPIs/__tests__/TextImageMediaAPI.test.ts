import { getTextMediaUploadSignature } from 'src/backend/controllers/utils/MediaAPIs/TextImageMediaAPI';
import MediaTypes from 'src/backend/shared/constants/MediaTypes';
import { dropMongoDBCollections } from 'src/__tests__/shared';

jest.mock('aws-sdk');
jest.mock('src/backend/controllers/utils/MediaAPIs/initializeAPI');

describe('AudioAPI Development', () => {
  describe('AWS methods', () => {
    beforeEach(async () => {
      // Clear out database to start with a clean slate
      await dropMongoDBCollections();
      jest.resetModules();
    });

    it('creates a new text image with getTextMediaUploadSignature in development', async () => {
      const id = 'testing-id';
      const fileType = MediaTypes.PNG;
      const res = await getTextMediaUploadSignature({ id, fileType });
      expect(res).toEqual({ mediaUrl: 'mock-url/testing-id', signedRequest: 'mock-signed-request/testing-id' });
    });
  });
});
