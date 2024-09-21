import * as AudioAPI from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import AudioEventType from 'src/backend/shared/constants/AudioEventType';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { handleAudioPronunciation } from 'src/backend/controllers/utils/MediaAPIs/utils';

const { copyAudioPronunciation, createAudioPronunciation, deleteAudioPronunciation, renameAudioPronunciation } =
  AudioAPI;
jest.mock('aws-sdk');
jest.mock('src/backend/controllers/utils/MediaAPIs/initializeAPI');
jest.mock('src/backend/config', () => ({
  isAWSProduction: true,
  TEST_MONGO_URI: 'mongodb://127.0.0.1:27017/test_igbo_api',
}));
jest.mock('src/backend/controllers/utils/MediaAPIs/utils');

describe('AudioAPI Production', () => {
  describe('AWS methods', () => {
    beforeEach(async () => {
      // Clear out database to start with a clean slate
      await dropMongoDBCollections();
      jest.resetModules();
    });
    it('creates a new audio pronunciation with createAudioPronunciation in development', async () => {
      const id = 'testing-id';
      const pronunciationData = 'pronunciation-data';
      const res = await createAudioPronunciation(id, pronunciationData);
      expect(res).toEqual(`https://igbo-api-prod-local/audio-pronunciations/${id}.mp3`);
      expect(handleAudioPronunciation).toHaveBeenCalledWith({
        key: `audio-pronunciations/${id}.mp3`,
        event: AudioEventType.POST,
        size: 1024,
      });
    });
    it('copies a new audio pronunciation with copyAudioPronunciation in development', async () => {
      const oldId = 'old-id';
      const newId = 'new-id';
      const isMp3 = true;
      const res = await copyAudioPronunciation(oldId, newId, isMp3);
      expect(res).toEqual(`https://AWS_BUCKET.s3.AWS_REGION.amazonaws.com/audio-pronunciations/${newId}.mp3`);
      expect(handleAudioPronunciation).toHaveBeenCalledWith({
        key: `audio-pronunciations/${newId}.mp3`,
        event: AudioEventType.POST,
        size: 1024,
      });
    });
    it('renames an audio pronunciation with renameAudioPronunciation in development', async () => {
      const oldId = 'old-id';
      const newId = 'new-id';
      const isMp3 = true;
      const res = await renameAudioPronunciation(oldId, newId, isMp3);
      expect(res).toEqual(`https://AWS_BUCKET.s3.AWS_REGION.amazonaws.com/audio-pronunciations/${newId}.mp3`);
      expect(handleAudioPronunciation).toHaveBeenCalledWith({
        key: `audio-pronunciations/${newId}.mp3`,
        event: AudioEventType.POST,
        size: 1024,
      });
    });
    it('deletes an audio pronunciation with deleteAudioPronunciation in development', async () => {
      const id = 'testing-id';
      const isMp3 = true;
      const res = await deleteAudioPronunciation(id, isMp3);
      expect(res).toEqual({});
      expect(handleAudioPronunciation).toHaveBeenCalledWith({
        key: `audio-pronunciations/${id}.mp3`,
        event: AudioEventType.DELETE,
      });
    });
  });
});
