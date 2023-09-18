import axios from 'axios';
import { upload } from 'src/shared/utils/uploadToS3/helpers';

describe('helpers', () => {
  it('uploads the provided media data via axios', async () => {
    const requestSpy = jest.spyOn(axios, 'request').mockReturnValue(Promise.resolve());
    const payload = { signedRequest: '', mediaUrl: '', file: new File([], '') };
    await upload(payload);
    expect(requestSpy).toBeCalledWith({
      method: 'PUT',
      url: '',
      data: payload.file,
      headers: { 'Content-Type': payload.file.type, 'x-amz-acl': 'public-read' },
    });
  });
});
