import axios from 'axios';
import { useCallable } from 'src/hooks/useCallable';

const handleGenerateMediaSignedRequest = useCallable<any, any>('generateMediaSignedRequest');

const uploadMediaToS3 = async (
  { signedRequestResponse, file }
  : { signedRequestResponse: { signedRequest: string, mediaUrl: string }, file: File },
): Promise<string | void> => (new Promise((resolve, reject) => {
  axios({
    method: 'put',
    url: signedRequestResponse.signedRequest,
    data: file,
    headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
  })
    .then(() => {
      resolve(signedRequestResponse.mediaUrl);
    })
    .catch(reject);
}));

export default async ({ id, file } : { id: string, file: File }): Promise<string | void> => {
  const { data: { response: signedRequestResponse } } = (
    await handleGenerateMediaSignedRequest({ id, fileType: file.type })
  );
  if (signedRequestResponse?.mediaUrl?.startsWith?.('mock-')) {
    return signedRequestResponse.mediaUrl;
  }
  return uploadMediaToS3({ signedRequestResponse, file });
};
