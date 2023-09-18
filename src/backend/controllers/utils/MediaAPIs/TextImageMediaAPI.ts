import { getUploadSignature } from 'src/backend/controllers/utils/MediaAPIs/BaseMediaAPI';
import { SignedMediaResponse } from 'src/backend/controllers/utils/types/mediaTypes';
import MediaTypes from 'src/backend/shared/constants/MediaTypes';
import initializeAPI from './initializeAPI';

const { bucket, mediaPath } = initializeAPI('media/text-images');

/* Generates a URL of uploaded media from the frontend for Text Image */
export const getTextMediaUploadSignature = async ({
  id,
  fileType,
}: {
  id: string;
  fileType: MediaTypes;
}): Promise<SignedMediaResponse> => {
  if (!id) {
    throw new Error('id must be provided');
  }

  const params = {
    Bucket: bucket,
    Key: `${mediaPath}/${id}`,
    ContentType: fileType,
    ACL: 'public-read',
  };
  return getUploadSignature({ id, params });
};
