import removeAccents from 'src/backend/utils/removeAccents';
import { isAWSProduction, isCypress } from 'src/backend/config';
import MediaTypes from 'src/backend/shared/constants/MediaTypes';
import initializeAPI from './initializeAPI';

const {
  bucket,
  uriPath,
  dummyUriPath,
  mediaPath,
  s3,
  baseParams,
} = initializeAPI('media');

/* Puts a new media object in the AWS S3 Bucket */
export const createMedia = async (id: string, mediaData: string, mediaType: MediaTypes | string): Promise<string> => {
  if (!id || !mediaData) {
    throw new Error('id and media must be provided');
  }
  const mediaId = removeAccents.remove(id);
  if (isCypress || !isAWSProduction) {
    return `${dummyUriPath}${mediaId}`;
  }
  const base64Data = Buffer.from(mediaData.replace(/^data:.+;base64,/, ''), 'base64');
  const extension = mediaType;
  const mediaPrefix = mediaType === MediaTypes.MP3 ? 'audio' : 'video';
  const params = {
    ...baseParams,
    Key: `${mediaPath}/${mediaId}`,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: `${mediaPrefix}/${extension}`,
  };

  const { Location } = await s3.upload(params).promise();
  return Location;
};

/* Takes an old and new media id and copies it (copies) */
export const copyMedia = async (
  oldDocId: string,
  newDocId: string,
): Promise<any> => {
  const oldMediaId = removeAccents.remove(oldDocId);
  const newMediaId = removeAccents.remove(newDocId);
  try {
    if (isCypress || !isAWSProduction) {
      return `${dummyUriPath}${newMediaId}`;
    }

    const copyParams = {
      ...baseParams,
      Key: `${mediaPath}/${newMediaId}`,
      ACL: 'public-read',
      CopySource: `${bucket}/${mediaPath}/${oldMediaId}`,
      MetadataDirective: 'REPLACE',
    };

    await s3.copyObject(copyParams).promise();
    const copiedMediaUri = `${uriPath}/${newMediaId}`;
    return copiedMediaUri;
  } catch (err) {
    console.log(
      `Error occurred while copying media: ${err.message} with `
      + `ids of oldDocId: ${oldMediaId} and newDocId: ${newMediaId}`,
    );
    return null;
  }
};

/* Deletes a media object in the AWS S3 Bucket */
export const deleteMedia = async (id: string): Promise<any> => {
  if (!id) {
    throw new Error('No media id provided');
  }
  try {
    const mediaId = removeAccents.remove(id);
    if (isCypress || !isAWSProduction) {
      return `${dummyUriPath}${mediaId}`;
    }
    const params = {
      ...baseParams,
      Key: `${mediaPath}/${mediaId}`,
    };

    return await s3.deleteObject(params).promise();
  } catch (err) {
    throw new Error(`Error occurred while deleting media: ${err.message} with id ${id}`);
  }
};

/* Takes an old and new media id and renames it (copies and deletes) */
export const renameMedia = async (oldDocId: string, newDocId: string): Promise<any> => {
  if (isCypress || !isAWSProduction) {
    if (!oldDocId) {
      return '';
    }
    const newMediaId = removeAccents.remove(newDocId);
    return `${dummyUriPath}${newMediaId}`;
  }
  /**
   * If the Corpus Suggestion doesn't have media
   * for the field, then the media in the Corpus
   * will be deleted
   * */
  if (!oldDocId) {
    await deleteMedia(newDocId);
    return '';
  }

  try {
    const renamedMediaUri = await copyMedia(oldDocId, newDocId);
    await deleteMedia(oldDocId);

    return renamedMediaUri;
  } catch (err) {
    console.log('Error caught in renameMedia', err.message);
    throw err;
  }
};

/* Generates a URL of uploaded media from the frontend */
export const getUploadSignature = async ({ id, fileType } : { id: string, fileType: MediaTypes }) => {
  if (!id) {
    throw new Error('id must be provided');
  }
  if (isCypress || !isAWSProductionProduction) {
    return {
      signedRequest: `mock-signed-request/${id}`,
      mediaUrl: `mock-url/${id}`,
    };
  }

  const params = {
    Bucket: bucket,
    Key: `${mediaPath}/${id}`,
    ContentType: fileType,
    ACL: 'public-read',
  };
  const signedRequest = s3.getSignedUrl('putObject', params);
  const mediaUrl = `${uriPath}/${id}`;
  const response = { signedRequest, mediaUrl };
  return response;
};
