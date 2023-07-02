import {
  decrementTotalUserStat,
  getLoginStats,
  incrementTotalUserStat,
  onUpdateTotalAudioDashboardStats,
} from 'src/backend/controllers/stats';
import { audioPronunciationSchema } from 'src/backend/models/AudioPronunciation';
import { exampleSchema } from 'src/backend/models/Example';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { statSchema } from 'src/backend/models/Stat';
import StatTypes from 'src/backend/shared/constants/StatTypes';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
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

  it('returns all the login stats', async () => {
    const mongooseConnection = await connectDatabase();
    const sendMock = jest.fn(() => ({}));
    const Stat = mongooseConnection.model<Interfaces.Stat>('Stat', statSchema);
    const userStat = new Stat({ type: StatTypes.TOTAL_USERS, value: 0 });
    const exampleAudioStat = new Stat({ type: StatTypes.TOTAL_EXAMPLE_AUDIO, value: 50 });
    const exampleSuggestionStat = new Stat({ type: StatTypes.TOTAL_EXAMPLE_SUGGESTION_AUDIO, value: 50 });
    await userStat.save();
    await exampleAudioStat.save();
    await exampleSuggestionStat.save();

    await incrementTotalUserStat();
    // @ts-expect-error mongooseConnection
    await getLoginStats({ mongooseConnection }, { send: sendMock }, () => null);
    expect(sendMock).toBeCalledWith({
      hours: 100,
      volunteers: 1,
    });
    await disconnectDatabase();
  });

  it('increments the total number of users', async () => {
    const connection = await connectDatabase();
    const Stat = connection.model<Interfaces.Stat>('Stat', statSchema);
    const newStat = new Stat({ type: StatTypes.TOTAL_USERS, value: 0 });
    await newStat.save();
    const stat = await Stat.findOne({ type: StatTypes.TOTAL_USERS });
    expect(stat.value).toEqual(0);
    await incrementTotalUserStat();
    const updatedStat = await Stat.findOne({ type: StatTypes.TOTAL_USERS });
    expect(updatedStat.value).toEqual(1);
    await disconnectDatabase();
  });

  it('decrements the total number of users', async () => {
    const connection = await connectDatabase();
    const Stat = connection.model<Interfaces.Stat>('Stat', statSchema);
    const newStat = new Stat({ type: StatTypes.TOTAL_USERS, value: 0 });
    await newStat.save();
    const stat = await Stat.findOne({ type: StatTypes.TOTAL_USERS });
    expect(stat.value).toEqual(0);
    await decrementTotalUserStat();
    const updatedStat = await Stat.findOne({ type: StatTypes.TOTAL_USERS });
    expect(updatedStat.value).toEqual(0);
    await incrementTotalUserStat();
    await incrementTotalUserStat();
    const finalStat = await Stat.findOne({ type: StatTypes.TOTAL_USERS });
    expect(finalStat.value).toEqual(2);
    await disconnectDatabase();
  });
});
