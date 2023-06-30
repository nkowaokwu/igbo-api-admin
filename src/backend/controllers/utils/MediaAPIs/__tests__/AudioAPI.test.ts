import {
  copyAudioPronunciation,
  createAudioPronunciation,
  deleteAudioPronunciation,
  renameAudioPronunciation,
} from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import { dropMongoDBCollections } from 'src/__tests__/shared';

jest.mock('aws-sdk');
jest.mock('src/backend/controllers/utils/MediaAPIs/initializeAPI');

describe('AudioAPI Development', () => {
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
      expect(res).toEqual(`https://igbo-api-test-local/audio-pronunciations/${id}`);
    });
    it('copies a new audio pronunciation with copyAudioPronunciation in development', async () => {
      const oldId = 'old-id';
      const newId = 'new-id';
      const isMp3 = true;
      const res = await copyAudioPronunciation(oldId, newId, isMp3);
      expect(res).toEqual(`https://igbo-api-test-local/audio-pronunciations/${newId}`);
    });
    it('renames an audio pronunciation with renameAudioPronunciation in development', async () => {
      const oldId = 'old-id';
      const newId = 'new-id';
      const isMp3 = true;
      const res = await renameAudioPronunciation(oldId, newId, isMp3);
      expect(res).toEqual(`https://igbo-api-test-local/audio-pronunciations/${newId}`);
    });
    it('deletes an audio pronunciation with deleteAudioPronunciation in development', async () => {
      const id = 'testing-id';
      const isMp3 = true;
      const res = await deleteAudioPronunciation(id, isMp3);
      expect(res).toEqual(`https://igbo-api-test-local/audio-pronunciations/${id}`);
    });
  });
});
