import axios from 'axios';
import { useCallable } from 'src/hooks/useCallable';

const handleGenerateMediaSignedRequest = useCallable<any, any>('generateMediaSignedRequest');

const uploadMediaToS3 = async (
  { signedRequestResponse, file }
  : { signedRequestResponse: { signedRequest: string, mediaUrl: string }, file: File },
) => (new Promise((resolve, reject) => {
  axios({
    method: 'put',
    url: signedRequestResponse.signedRequest,
    data: file,
    headers: { 'Content-Type': file.type },
  })
    .then(() => resolve(signedRequestResponse.mediaUrl))
    .catch(reject);
}));

export default async ({ id, file } : { id: string, file: File }): Promise<any> => {
  const { data: signedRequestResponse } = await handleGenerateMediaSignedRequest({ id, fileType: file.type });
  if (signedRequestResponse?.mediaUrl?.startsWith?.('mock-')) {
    return signedRequestResponse.mediaUrl;
  }
  return uploadMediaToS3({ signedRequestResponse, file });
};
