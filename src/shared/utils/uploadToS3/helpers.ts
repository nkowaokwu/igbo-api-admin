import axios from 'axios';
import { MediaSignedPayload, SignedMediaResponse } from 'src/backend/controllers/utils/types/mediaTypes';
import { useCallable } from 'src/hooks/useCallable';

export const handleGenerateMediaSignedRequest = useCallable<MediaSignedPayload, SignedMediaResponse>(
  'generateMediaSignedRequest',
);

export const upload = async ({
  signedRequest,
  mediaUrl,
  file,
}: {
  signedRequest: string;
  mediaUrl: string;
  file: File;
}): Promise<string | void> =>
  new Promise((resolve, reject) => {
    axios
      .request({
        method: 'PUT',
        url: signedRequest,
        data: file,
        headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
      })
      .then(() => {
        resolve(mediaUrl);
      })
      .catch(reject);
  });
