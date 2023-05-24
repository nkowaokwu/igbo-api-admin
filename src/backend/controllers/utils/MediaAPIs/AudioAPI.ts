import removeAccents from 'src/backend/utils/removeAccents';
import { isAWSProduction, isCypress } from 'src/backend/config';
import { PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import initializeAPI from './initializeAPI';

const {
  bucket,
  uriPath,
  dummyUriPath,
  mediaPath,
  s3,
  baseParams,
} = initializeAPI('audio-pronunciations');

/* Puts a new .mp3 object in the AWS S3 Bucket */
export const createAudioPronunciation = async (id: string, pronunciationData: string): Promise<string> => {
  if (!id || !pronunciationData) {
    throw new Error('id and pronunciation must be provided');
  }
  const audioId = removeAccents.remove(id);
  if (isCypress || !isAWSProduction) {
    return `${dummyUriPath}${audioId}`;
  }
  const base64Data = Buffer.from(pronunciationData.replace(/^data:.+;base64,/, ''), 'base64');
  const params = {
    ...baseParams,
    Key: `${mediaPath}/${audioId}.mp3`,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: 'audio/mp3',
    Bucket: bucket,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  const audioPronunciationUri = `${uriPath}/${audioId}.mp3`;

  return audioPronunciationUri;
};

/* Deletes an audio object in the AWS S3 Bucket */
export const deleteAudioPronunciation = async (id: string, isMp3 = false): Promise<any> => {
  if (!id) {
    throw new Error('No pronunciation id provided');
  }
  try {
    const audioId = removeAccents.remove(id);
    if (isCypress || !isAWSProduction) {
      return `${dummyUriPath}${audioId}`;
    }
    const extension = isMp3 ? 'mp3' : 'webm';
    const params = {
      ...baseParams,
      Key: `${mediaPath}/${audioId}.${extension}`,
      Bucket: bucket,
    };

    const command = await new DeleteObjectCommand(params);
    const deletedObject = await s3.send(command);

    return deletedObject;
  } catch (err) {
    throw new Error(`Error occurred while deleting audio: ${err.message} with id ${id}`);
  }
};

/* Takes an old and new pronunciation id and copies it (copies) */
export const copyAudioPronunciation = async (
  oldDocId: string,
  newDocId: string,
  isMp3 = false,
): Promise<string> => {
  const oldAudioId = removeAccents.remove(oldDocId);
  const newAudioId = removeAccents.remove(newDocId);
  try {
    if (isCypress || !isAWSProduction) {
      return `${dummyUriPath}${newAudioId}`;
    }

    const extension = isMp3 ? 'mp3' : 'webm';

    const copyParams = {
      ...baseParams,
      MetadataDirective: 'REPLACE',
      Key: `${mediaPath}/${newAudioId}.${extension}`,
      ACL: 'public-read',
      CopySource: `${bucket}/${mediaPath}/${oldAudioId}.${extension}`,
      Bucket: bucket,
    };

    const command = new CopyObjectCommand(copyParams);
    await s3.send(command);

    const copiedAudioPronunciationUri = `${uriPath}/${newAudioId}.${extension}`;
    return copiedAudioPronunciationUri;
  } catch (err) {
    console.error(
      `Error occurred while copying audio: ${err.message} with `
      + `ids of oldDocId: ${oldAudioId} and newDocId: ${newAudioId}`,
    );
    // If the old and new audio ids are the same we don't want to through an error
    if ((oldAudioId.includes('-') || newAudioId.includes('-')) && oldAudioId !== newAudioId) {
      throw new Error(`Unable to save dialectal audio recording, please re-record dialect audio for: ${oldAudioId}`);
    }
    return null;
  }
};

/* Takes an old and new pronunciation id and renames it (copies and deletes) */
export const renameAudioPronunciation = async (oldDocId: string, newDocId: string, isMp3 = false): Promise<string> => {
  if (isCypress || !isAWSProduction) {
    if (!oldDocId) {
      return '';
    }
    const newAudioId = removeAccents.remove(newDocId);
    return `${dummyUriPath}${newAudioId}`;
  }
  /**
   * If the Word Suggestion doesn't have an audio pronunciation
   * for the field, then the audio pronunciation in the Word
   * will be deleted
   * */
  if (!oldDocId) {
    await deleteAudioPronunciation(newDocId);
    return '';
  }

  try {
    const renamedAudioPronunciationUri = await copyAudioPronunciation(oldDocId, newDocId, isMp3);
    await deleteAudioPronunciation(oldDocId);

    return renamedAudioPronunciationUri;
  } catch (err) {
    console.log('Error caught in renameAudioPronunciation', err.message);
    throw err;
  }
};
