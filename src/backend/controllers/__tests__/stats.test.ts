import { onUpdateTotalAudioDashboardStats } from 'src/backend/controllers/stats';
import { audioPronunciationSchema } from 'src/backend/models/AudioPronunciation';
import { exampleSchema } from 'src/backend/models/Example';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { connectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';
import * as Interfaces from '../utils/interfaces';

describe('Stats', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
  });
  it('calculates the total number of hours of example audio', async () => {
    const connection = await connectDatabase();
    const Example = connection.model<Interfaces.Example>('Example', exampleSchema);
    const AudioPronunciation = connection.model<Interfaces.AudioPronunciation>(
      'AudioPronunciation',
      audioPronunciationSchema,
    );

    const example = new Example({
      exampleSuggestionData,
      pronunciations: [{ audio: 'https://test.com/audio-pronunciations/first-audio.mp3', speaker: '' }],
    });
    await example.save();
    const audioPronunciation = new AudioPronunciation({
      objectId: 'audio-pronunciations/first-audio.mp3',
      size: 160000000,
    });

    await audioPronunciation.save();
    expect((await onUpdateTotalAudioDashboardStats())[0].totalExampleAudio).toBeGreaterThanOrEqual(1);
    expect((await onUpdateTotalAudioDashboardStats())[1].totalExampleSuggestionAudio).toBeLessThanOrEqual(0);
  });

  it('calculates the total number of hours of example suggestion audio', async () => {
    const connection = await connectDatabase();
    const ExampleSuggestion = connection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );
    const AudioPronunciation = connection.model<Interfaces.AudioPronunciation>(
      'AudioPronunciation',
      audioPronunciationSchema,
    );

    const example = new ExampleSuggestion({
      exampleSuggestionData,
      pronunciations: [{ audio: 'https://test.com/audio-pronunciations/first-audio.mp3', speaker: '', review: true }],
    });
    const response = await example.save();
    const audioPronunciation = new AudioPronunciation({
      objectId: response.pronunciations[0].audio.split(/.com\//)[1],
      size: 160000000,
    });

    await audioPronunciation.save();
    expect((await onUpdateTotalAudioDashboardStats())[0].totalExampleAudio).toBeLessThanOrEqual(0);
    expect((await onUpdateTotalAudioDashboardStats())[1].totalExampleSuggestionAudio).toBeGreaterThanOrEqual(1);
  });
});
