import { audioPronunciationSchema } from 'src/backend/models/AudioPronunciation';
import { handleAudioPronunciation } from 'src/backend/controllers/utils/MediaAPIs/utils';
import AudioEventType from 'src/backend/shared/constants/AudioEventType';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';

describe('handleAudioPronunciation', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
  });
  it('creates a new AudioPronunciation document after audio has been saved to S3', async () => {
    const key = 'testing-key';
    const size = 1024;
    const event = AudioEventType.POST;
    const res = await handleAudioPronunciation({ key, size, event });
    expect(res.objectId).toEqual(key);
    expect(res.size).toEqual(size);
    expect(res.prevSize).toEqual(-1);
  });

  it("updates an existing AudioPronunciation document with prevSize if it's getting updated", async () => {
    const key = 'testing-key';
    const size = 1024;
    const updatedSize = 2048;
    const event = AudioEventType.POST;
    const audioPronunciationRes = await handleAudioPronunciation({ key, size, event });
    expect(audioPronunciationRes.objectId).toEqual(key);
    expect(audioPronunciationRes.size).toEqual(size);
    expect(audioPronunciationRes.prevSize).toEqual(-1);

    const res = await handleAudioPronunciation({ key, size: updatedSize, event });
    expect(res.objectId).toEqual(key);
    expect(res.size).toEqual(updatedSize);
    expect(res.prevSize).toEqual(size);
  });

  it('delete an existing AudioPronunciation document', async () => {
    const connection = await connectDatabase();
    const AudioPronunciation = connection.model('AudioPronunciation', audioPronunciationSchema);

    const key = 'testing-key';
    const size = 1024;
    const event = AudioEventType.POST;
    const updatedEvent = AudioEventType.DELETE;

    const audioPronunciationRes = await handleAudioPronunciation({ key, size, event });
    expect(audioPronunciationRes.objectId).toEqual(key);
    expect(audioPronunciationRes.size).toEqual(size);
    expect(audioPronunciationRes.prevSize).toEqual(-1);

    const audioPronunciationFromDatabaseRes = await AudioPronunciation.findById(audioPronunciationRes._id.toString());
    expect(audioPronunciationFromDatabaseRes).toBeTruthy();

    await handleAudioPronunciation({ key, event: updatedEvent });
    const res = await AudioPronunciation.findById(audioPronunciationRes._id.toString());
    await disconnectDatabase();

    expect(res).toEqual(null);
  });
});
