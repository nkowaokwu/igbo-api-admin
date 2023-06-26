import { onUpdateTotalAudioDashboardStats } from 'src/backend/controllers/stats';
import { audioPronunciationSchema } from 'src/backend/models/AudioPronunciation';
import { exampleSchema } from 'src/backend/models/Example';
import { connectDatabase } from 'src/backend/utils/database';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';
import * as Interfaces from '../utils/interfaces';

describe('Stats', () => {
  it('calculates the total number of hours of audio', async () => {
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
    expect((await onUpdateTotalAudioDashboardStats()).totalExampleAudio).toBeGreaterThanOrEqual(1);
  });
});
