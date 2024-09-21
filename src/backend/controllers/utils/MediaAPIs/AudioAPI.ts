import { pick } from 'lodash';
import removeAccents from 'src/backend/utils/removeAccents';
import { isAWSProduction } from 'src/backend/config';
import AudioEventType from 'src/backend/shared/constants/AudioEventType';
import { handleAudioPronunciation } from 'src/backend/controllers/utils/MediaAPIs/utils';
import initializeAPI from './initializeAPI';

const { bucket, uriPath, dummyUriPath, mediaPath, s3, baseParams } = initializeAPI('audio-pronunciations');
const DEFAULT_CONTENT_LENGTH = 1024;

const generateExtension = (isMp3: boolean) => (isMp3 ? 'mp3' : 'webm');

/* Puts a new .mp3 object in the AWS S3 Bucket */
export const createAudioPronunciation = (id: string, pronunciationData: string): Promise<string> =>
  new Promise((resolve) => {
    console.log(`Attempting to create audio pronunciation for ${id}`);
    if (!id || !pronunciationData) {
      throw new Error('id and pronunciation must be provided');
    }
    const audioId = removeAccents.remove(id);
    if (!isAWSProduction) {
      const Key = `${dummyUriPath}${audioId}`;
      return handleAudioPronunciation({ key: Key, size: DEFAULT_CONTENT_LENGTH, event: AudioEventType.POST }).then(() =>
        resolve(Key),
      );
    }
    const base64Data = Buffer.from(pronunciationData.replace(/^data:.+;base64,/, ''), 'base64');
    const params = {
      ...baseParams,
      Key: `${mediaPath}/${audioId}.mp3`,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: 'audio/mp3',
    };

    return s3
      .upload(params)
      .promise()
      .then(async ({ Location }) => {
        const data = await s3
          .headObject(pick(params, ['Bucket', 'Key']))
          .promise()
          // console.log(`Unable to to get head of S3 object: ${err.message}`, params);
          .catch(() => resolve(Location));
        if (data && typeof data.ContentLength === 'number') {
          await handleAudioPronunciation({ key: params.Key, size: data.ContentLength, event: AudioEventType.POST });
        } else {
          console.log('Did not save Audio Pronunciation', data);
        }
        return resolve(Location);
      });
  });

/* Deletes an audio object in the AWS S3 Bucket */
export const deleteAudioPronunciation = (id: string, isMp3 = false): Promise<any> =>
  new Promise((resolve) => {
    console.log(`Attempting to delete audio pronunciation for ${id}`, { isMp3 });
    if (!id) {
      throw new Error('No pronunciation id provided');
    }
    try {
      const audioId = removeAccents.remove(id);
      if (!isAWSProduction) {
        const Key = `${dummyUriPath}${audioId}`;
        return handleAudioPronunciation({ key: Key, event: AudioEventType.DELETE }).then(() => resolve(Key));
      }
      const extension = generateExtension(isMp3);
      const params = {
        ...baseParams,
        Key: `${mediaPath}/${audioId}.${extension}`,
      };

      return s3
        .deleteObject(params)
        .promise()
        .then(async (deletedObject) => {
          const data = await s3
            .headObject(pick(params, ['Bucket', 'Key']))
            .promise()
            .catch(() => {
              console.log('Unable to to get head of S3 object', params);
              return resolve(deletedObject);
            });

          if (data) {
            await handleAudioPronunciation({ key: params.Key, event: AudioEventType.DELETE });
          }

          return resolve(deletedObject);
        });
    } catch (err) {
      throw new Error(`Error occurred while deleting audio: ${err.message} with id ${id}`);
    }
  });

/* Takes an old and new pronunciation id and copies it (copies) */
export const copyAudioPronunciation = (oldDocId: string, newDocId: string, isMp3 = false): Promise<string> =>
  new Promise((resolve) => {
    const oldAudioId = removeAccents.remove(oldDocId);
    const newAudioId = removeAccents.remove(newDocId);
    try {
      if (!isAWSProduction) {
        const Key = `${dummyUriPath}${newAudioId}`;
        return handleAudioPronunciation({
          key: Key,
          size: DEFAULT_CONTENT_LENGTH,
          event: AudioEventType.POST,
        }).then(() => resolve(Key));
      }
      console.log(`Attempting to copy old audio pronunciation of ${oldAudioId} to ${newAudioId}`, { isMp3 });

      const copyParams = {
        ...baseParams,
        MetadataDirective: 'REPLACE',
        Key: `${mediaPath}/${newAudioId}.mp3`,
        ACL: 'public-read',
        // TODO: Monitor this line if unable to work with audio recordings or if audio is not saving
        CopySource: `${bucket}/${mediaPath}/${oldAudioId}.mp3`,
      };

      return s3
        .copyObject(copyParams)
        .promise()
        .then(async () => {
          const copiedAudioPronunciationUri = `${uriPath}/${newAudioId}.mp3`;
          const data = await s3
            .headObject(pick(copyParams, ['Bucket', 'Key']))
            .promise()
            .catch(() => {
              console.log('Unable to to get head of S3 object', copyParams);
              return resolve(copiedAudioPronunciationUri);
            });

          if (data && typeof data.ContentLength === 'number') {
            await handleAudioPronunciation({
              key: copyParams.Key,
              size: data.ContentLength,
              event: AudioEventType.POST,
            });
          }

          resolve(copiedAudioPronunciationUri);
        });
    } catch (err) {
      console.error(
        `Error occurred while copying audio: ${err.message} with ` +
          `ids of oldDocId: ${oldAudioId} and newDocId: ${newAudioId}`,
      );
      // If the old and new audio ids are the same we don't want to through an error
      if ((oldAudioId.includes('-') || newAudioId.includes('-')) && oldAudioId !== newAudioId) {
        throw new Error(`Unable to save dialectal audio recording, please re-record dialect audio for: ${oldAudioId}`);
      }
      return resolve(null);
    }
  });

/* Takes an old and new pronunciation id and renames it (copies and deletes) */
export const renameAudioPronunciation = async (oldDocId: string, newDocId: string, isMp3 = false): Promise<string> => {
  if (!isAWSProduction) {
    if (!oldDocId) {
      return '';
    }
    const newAudioId = removeAccents.remove(newDocId);
    return `${dummyUriPath}${newAudioId}`;
  }
  console.log(`Attempting to rename old audio pronunciation of ${oldDocId} to ${newDocId}`, { isMp3 });
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
