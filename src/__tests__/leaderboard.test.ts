import { times } from 'lodash';
import { v4 as uuid } from 'uuid';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import * as userMethods from 'src/backend/controllers/users';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import { exampleSuggestionData } from './__mocks__/documentData';
import { AUTH_TOKEN } from './shared/constants';
import {
  suggestNewExample,
  getRandomExampleSuggestionsToReview,
  putAudioForRandomExampleSuggestions,
  putReviewForRandomExampleSuggestions,
  getLeaderboard,
} from './shared/commands';

describe('MongoDB Leaderboards', () => {
  beforeEach(() => {
    const findUserSpy = jest.spyOn(userMethods, 'findUser');
    findUserSpy.mockImplementation(async (uid) => ({
      uid,
      id: uid,
      editingGroup: '1',
      role: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
      displayName: 'User name',
      email: 'user@example.com',
      photoURL: '',
      lastSignInTime: 'date',
      creationTime: 'date',
    }));
  });

  describe('/GET mongodb leaderboards', () => {
    it("return an empty verify example audio leader that doesn't exist", async () => {
      const findUserSpy = jest.spyOn(userMethods, 'findUser');
      findUserSpy.mockImplementation(async (uid) => ({
        uid,
        id: uid,
        editingGroup: '1',
        role: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN,
        displayName: 'User name',
        email: 'user@example.com',
        photoURL: '',
        lastSignInTime: 'date',
        creationTime: 'date',
      }));
      const res = await getLeaderboard(
        { leaderboard: LeaderboardType.VERIFY_EXAMPLE_AUDIO },
        { token: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN },
      );
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('userRanking');
      expect(res.body.userRanking.count).toEqual(-1);
      expect(res.body.userRanking.position).toEqual(null);
      expect(res.body.userRanking.email).toEqual('user@example.com');
      expect(res.body.userRanking.displayName).toEqual('User name');
      expect(res.body.userRanking.uid).toEqual(AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN);
      expect(res.body).toHaveProperty('rankings');
      expect(res.body.rankings.length).toBeGreaterThanOrEqual(0);
    });

    it("return an empty record example audio leader that doesn't exist", async () => {
      const findUserSpy = jest.spyOn(userMethods, 'findUser');
      findUserSpy.mockImplementation(async (uid) => ({
        uid,
        id: uid,
        editingGroup: '1',
        role: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN,
        displayName: 'User name',
        email: 'user@example.com',
        photoURL: '',
        lastSignInTime: 'date',
        creationTime: 'date',
      }));
      const res = await getLeaderboard(
        { leaderboard: LeaderboardType.RECORD_EXAMPLE_AUDIO },
        { token: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN },
      );

      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('userRanking');
      // Handle race condition with another test
      if (res.body.userRanking.count === 5) {
        expect(res.body.userRanking.count).toEqual(5);
        expect(res.body.userRanking.position).toEqual(2);
      } else {
        expect(res.body.userRanking.count).toEqual(-1);
        expect(res.body.userRanking.position).toEqual(null);
      }
      expect(res.body.userRanking.email).toEqual('user@example.com');
      expect(res.body.userRanking.displayName).toEqual('User name');
      expect(res.body.userRanking.uid).toEqual(AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN);
      expect(res.body).toHaveProperty('rankings');
      expect(res.body.rankings.length).toBeGreaterThanOrEqual(0);
    });

    it('return accurate user stats after recording audio for a sentence', async () => {
      const examples = [];
      await Promise.all(
        times(5, async () => {
          const exampleRes = await suggestNewExample(
            {
              ...exampleSuggestionData,
              igbo: uuid(),
              pronunciations: [{ audio: 'first-audio', speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN }],
            },
            { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
          );
          expect(exampleRes.body.approvals).toHaveLength(0);
          expect(exampleRes.body.denials).toHaveLength(0);
          examples.push(exampleRes.body);
        }),
      );
      const updateExamplePayload = examples.map(({ id }) => ({
        id,
        pronunciation: `pronunciation-${id}`,
      }));
      const updatedExamplesRes = await putAudioForRandomExampleSuggestions(updateExamplePayload);
      expect(updatedExamplesRes.status).toEqual(200);

      const res = await getLeaderboard({
        leaderboard: LeaderboardType.RECORD_EXAMPLE_AUDIO,
        timeRange: LeaderboardTimeRange.ALL_TIME,
      });
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('userRanking');
      expect(res.body.userRanking.count).toBeGreaterThanOrEqual(5);
      expect(res.body.userRanking.position).toEqual(1);
      expect(res.body.userRanking.email).toEqual('user@example.com');
      expect(res.body.userRanking.displayName).toEqual('User name');
      expect(res.body.userRanking.uid).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(res.body).toHaveProperty('rankings');
      expect(res.body.rankings.length).toBeGreaterThanOrEqual(1);
    });

    it('return accurate user stats after reviewing audio for a sentence', async () => {
      const examples = [];
      await Promise.all(
        times(5, async () => {
          const exampleRes = await suggestNewExample(
            {
              ...exampleSuggestionData,
              igbo: uuid(),
              pronunciations: [{ audio: 'first-audio', speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN }],
            },
            { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
          );
          expect(exampleRes.body.approvals).toHaveLength(0);
          expect(exampleRes.body.denials).toHaveLength(0);
          examples.push(exampleRes.body);
        }),
      );
      const randomExampleSuggestionsRes = await getRandomExampleSuggestionsToReview({ range: '[0, 4]' });
      expect(randomExampleSuggestionsRes.status).toEqual(200);
      expect(randomExampleSuggestionsRes.body.length).toEqual(5);
      const reviewedExampleSuggestions = randomExampleSuggestionsRes.body.map(({ id, pronunciations }, index) => {
        expect(Array.isArray(pronunciations)).toBeTruthy();
        expect(pronunciations.length).toBeGreaterThanOrEqual(1);
        const reviews = pronunciations.reduce(
          (reviewObject, { _id }) => ({
            ...reviewObject,
            [_id.toString()]:
              index === 0 ? ReviewActions.APPROVE : index === 1 ? ReviewActions.DENY : ReviewActions.SKIP,
          }),
          {},
        );
        return { id, reviews };
      });
      const updatedRandomExampleSuggestionRes = await putReviewForRandomExampleSuggestions(reviewedExampleSuggestions);
      expect(updatedRandomExampleSuggestionRes.status).toEqual(200);

      const res = await getLeaderboard({
        leaderboard: LeaderboardType.VERIFY_EXAMPLE_AUDIO,
        timeRange: LeaderboardTimeRange.ALL_TIME,
      });
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('userRanking');
      expect(res.body.userRanking.count).toBeGreaterThanOrEqual(2);
      expect(res.body.userRanking.position).toEqual(1);
      expect(res.body.userRanking.email).toEqual('user@example.com');
      expect(res.body.userRanking.displayName).toEqual('User name');
      expect(res.body.userRanking.uid).toEqual(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
      expect(res.body).toHaveProperty('rankings');
      expect(res.body.rankings).toHaveLength(1);
    });
  });
});
