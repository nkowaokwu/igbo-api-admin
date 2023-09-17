import { Media } from 'src/backend/controllers/utils/types/mediaTypes';
import { handleGenerateMediaSignedRequest, upload } from 'src/shared/utils/uploadToS3/helpers';

/* Handle associating media with a specified collection */
export const handleMediaUpload = async ({ collection, data }: Media): Promise<string | void> => {
  const {
    data: { mediaUrl, signedRequest },
  } = await handleGenerateMediaSignedRequest({ collection, data: { id: data.id, fileType: data.file.type } });
  if (mediaUrl.startsWith?.('mock-')) {
    return mediaUrl;
  }
  return upload({ mediaUrl, signedRequest, file: data.file });
};

const uploadToS3 = (payload: Media): Promise<(string | void) | null> => handleMediaUpload(payload);

export default uploadToS3;
