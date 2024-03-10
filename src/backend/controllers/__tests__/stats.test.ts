import moment from 'moment';
import * as admin from 'firebase-admin';
import {
  decrementTotalUserStat,
  getLoginStats,
  getUserAudioStats,
  incrementTotalUserStat,
  onUpdateTotalAudioDashboardStats,
} from 'src/backend/controllers/stats';
import { audioPronunciationSchema } from 'src/backend/models/AudioPronunciation';
import { exampleSchema } from 'src/backend/models/Example';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { statSchema } from 'src/backend/models/Stat';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import StatTypes from 'src/backend/shared/constants/StatTypes';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import {
  putReviewForRandomExampleSuggestions,
  suggestNewExample,
  getUserAudioStats as getUserAudioStatsCommand,
} from 'src/__tests__/shared/commands';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';
import { allUsers } from 'src/__tests__/__mocks__/user_data';
import { requestFixture } from 'src/__tests__/shared/fixtures/requestFixtures';
import * as Interfaces from '../utils/interfaces';

describe('Stats', () => {
  describe('Stats Controller', () => {
    beforeEach(async () => {
      // Clear out database to start with a clean slate
      await dropMongoDBCollections();
      jest.spyOn(admin, 'auth').mockReturnValue({
        listUsers: jest.fn(async () => ({ users: allUsers })),
        getUser: jest.fn(async (uid: string) => allUsers.find(({ uid: userId }) => userId === uid)),
      });
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
      await disconnectDatabase();
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
      const sendMock = jest.fn();
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
      expect(sendMock).toHaveBeenCalledWith({
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

    it.skip("gets the user's approved audio stats", async () => {
      const mongooseConnection = await connectDatabase();
      const exampleSuggestionRes = await suggestNewExample({
        ...exampleSuggestionData,
        pronunciations: [
          {
            audio: 'first audio',
            speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
          },
        ],
      });
      expect(exampleSuggestionRes.status).toEqual(200);
      const mergerRes = await putReviewForRandomExampleSuggestions(
        [
          {
            id: exampleSuggestionRes.body.id,
            reviews: {
              [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.APPROVE,
            },
          },
        ],
        { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
      );
      expect(mergerRes.status).toEqual(200);
      const editorRes = await putReviewForRandomExampleSuggestions(
        [
          {
            id: exampleSuggestionRes.body.id,
            reviews: {
              [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.APPROVE,
            },
          },
        ],
        { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN },
      );
      expect(editorRes.status).toEqual(200);

      const mockRes = {
        send: jest.fn(),
      };
      const mockNext = jest.fn();
      await getUserAudioStats(
        // @ts-expect-error
        { mongooseConnection, user: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN } },
        mockRes,
        mockNext,
      );
      expect(mockRes.send).toHaveBeenCalledWith({
        timestampedAudioApprovals: { [moment().format('MMM, YYYY')]: 1 },
        timestampedAudioDenials: {},
      });
      await disconnectDatabase();
    });

    it("gets the user's denied audio stats", async () => {
      const mongooseConnection = await connectDatabase();
      const exampleSuggestionRes = await suggestNewExample({
        ...exampleSuggestionData,
        pronunciations: [
          {
            audio: 'first audio',
            speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
          },
        ],
      });
      expect(exampleSuggestionRes.status).toEqual(200);
      const mergerRes = await putReviewForRandomExampleSuggestions(
        [
          {
            id: exampleSuggestionRes.body.id,
            reviews: {
              [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.DENY,
            },
          },
        ],
        { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
      );
      expect(mergerRes.status).toEqual(200);

      const mockRes = {
        send: jest.fn(),
      };
      const mockNext = jest.fn();
      await getUserAudioStats(
        requestFixture({
          mongooseConnection,
          params: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
        }),
        // @ts-expect-error
        mockRes,
        mockNext,
      );
      expect(mockRes.send).toHaveBeenCalledWith({
        timestampedAudioApprovals: {},
        timestampedAudioDenials: { [moment().format('MMM, YYYY')]: 1 },
      });
      await disconnectDatabase();
    });

    it("gets another user's denied audio stats as the admin", async () => {
      const mongooseConnection = await connectDatabase();
      const exampleSuggestionRes = await suggestNewExample({
        ...exampleSuggestionData,
        pronunciations: [
          {
            audio: 'first audio',
            speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN,
          },
        ],
      });
      expect(exampleSuggestionRes.status).toEqual(200);
      const mergerRes = await putReviewForRandomExampleSuggestions(
        [
          {
            id: exampleSuggestionRes.body.id,
            reviews: {
              [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.DENY,
            },
          },
        ],
        { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
      );
      expect(mergerRes.status).toEqual(200);

      const mockRes = {
        send: jest.fn(),
      };
      const mockNext = jest.fn();
      await getUserAudioStats(
        {
          mongooseConnection,
          params: { uid: AUTH_TOKEN.MERGER_AUTH_TOKEN },
          // @ts-expect-error
          user: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
        },
        mockRes,
        mockNext,
      );
      expect(mockRes.send).toHaveBeenCalledWith({
        timestampedAudioApprovals: {},
        timestampedAudioDenials: { [moment().format('MMM, YYYY')]: 1 },
      });
      await disconnectDatabase();
    });
  });

  // TODO: write test for network request getUserMergeStats
  describe('Stats Network', () => {
    beforeEach(async () => {
      // Clear out database to start with a clean slate
      await dropMongoDBCollections();
      jest.spyOn(admin, 'auth').mockReturnValue({
        listUsers: jest.fn(async () => ({ users: allUsers })),
        getUser: jest.fn(async (uid: string) => allUsers.find(({ uid: userId }) => userId === uid)),
      });
    });

    it('fetches user audio stats', async () => {
      const exampleSuggestionRes = await suggestNewExample({
        ...exampleSuggestionData,
        pronunciations: [
          {
            audio: 'first audio',
            speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN,
          },
        ],
      });
      expect(exampleSuggestionRes.status).toEqual(200);
      const mergerRes = await putReviewForRandomExampleSuggestions(
        [
          {
            id: exampleSuggestionRes.body.id,
            reviews: {
              [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.DENY,
            },
          },
        ],
        { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
      );
      expect(mergerRes.status).toEqual(200);

      const res = await getUserAudioStatsCommand(AUTH_TOKEN.MERGER_AUTH_TOKEN, { token: AUTH_TOKEN.MERGER_AUTH_TOKEN });
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({
        timestampedAudioApprovals: {},
        timestampedAudioDenials: { [moment().format('MMM, YYYY')]: 1 },
      });
    });

    it('fetches another user audio stats as admin', async () => {
      const exampleSuggestionRes = await suggestNewExample({
        ...exampleSuggestionData,
        pronunciations: [
          {
            audio: 'first audio',
            speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN,
          },
        ],
      });
      expect(exampleSuggestionRes.status).toEqual(200);
      const mergerRes = await putReviewForRandomExampleSuggestions(
        [
          {
            id: exampleSuggestionRes.body.id,
            reviews: {
              [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.DENY,
            },
          },
        ],
        { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
      );
      expect(mergerRes.status).toEqual(200);

      const res = await getUserAudioStatsCommand(AUTH_TOKEN.MERGER_AUTH_TOKEN);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({
        timestampedAudioApprovals: {},
        timestampedAudioDenials: { [moment().format('MMM, YYYY')]: 1 },
      });
    });

    it('fails to fetch another user audio stats as editor', async () => {
      const exampleSuggestionRes = await suggestNewExample({
        ...exampleSuggestionData,
        pronunciations: [
          {
            audio: 'first audio',
            speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN,
          },
        ],
      });
      expect(exampleSuggestionRes.status).toEqual(200);
      const mergerRes = await putReviewForRandomExampleSuggestions(
        [
          {
            id: exampleSuggestionRes.body.id,
            reviews: {
              [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.DENY,
            },
          },
        ],
        { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
      );
      expect(mergerRes.status).toEqual(200);

      const res = await getUserAudioStatsCommand(AUTH_TOKEN.MERGER_AUTH_TOKEN, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });
  });
});
