import { isAWSProduction, isCypress } from 'src/backend/config';
import { SignedMediaResponse } from 'src/backend/controllers/utils/types/mediaTypes';
import MediaTypes from 'src/backend/shared/constants/MediaTypes';
import initializeAPI from './initializeAPI';

const { uriPath, s3 } = initializeAPI('media');

type BaseParams = {
  Bucket: string;
  Key: string;
  ContentType: MediaTypes;
  ACL: string;
};

/* Generates a URL of uploaded media from the frontend */
export const getUploadSignature = async ({
  id,
  params,
}: {
  id: string;
  params: BaseParams;
}): Promise<SignedMediaResponse> => {
  if (isCypress || !isAWSProduction) {
    return {
      signedRequest: `mock-signed-request/${id}`,
      mediaUrl: `mock-url/${id}`,
    };
  }

  const signedRequest = s3.getSignedUrl('putObject', params);
  const mediaUrl = `${uriPath}/${id}`;
  const response = { signedRequest, mediaUrl };
  return response;
};
