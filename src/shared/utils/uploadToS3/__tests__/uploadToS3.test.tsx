import axios from 'axios';
import Collection from 'src/shared/constants/Collection';
import { handleMediaUpload } from 'src/shared/utils/uploadToS3';
import * as uploadToS3Helpers from 'src/shared/utils/uploadToS3/helpers';

describe('uploadToS3', () => {
  it('handleMediaUpload', async () => {
    const handleGenerateMediaSignedRequestSpy = jest
      .spyOn(uploadToS3Helpers, 'handleGenerateMediaSignedRequest')
      .mockReturnValue(Promise.resolve({ data: { mediaUrl: '', signedRequest: '' } }));
    const uploadSpy = jest.spyOn(uploadToS3Helpers, 'upload').mockReturnValue();
    jest.spyOn(axios, 'request').mockReturnValue(Promise.resolve());

    const payload = { collection: Collection.TEXT_IMAGE, data: { id: 'id', file: new File([], '') } };
    await handleMediaUpload(payload);
    expect(handleGenerateMediaSignedRequestSpy).toBeCalledWith({
      collection: Collection.TEXT_IMAGE,
      data: { id: payload.data.id, fileType: payload.data.file.type },
    });
    expect(uploadSpy).toBeCalledWith({ mediaUrl: '', signedRequest: '', file: payload.data.file });
  });
});
