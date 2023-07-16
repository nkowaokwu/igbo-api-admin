import moment from 'moment';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import {
  searchExampleAudioPronunciationsReviewedByUser,
  searchExampleAudioPronunciationsRecordedByUser,
} from '../leaderboardQueries';

describe('leaderboardQueries', () => {
  describe('searchExampleAudioPronunciationsReviewedByUser', () => {
    it('generates a query for all time', () => {
      const uid = 'user-uid';
      const timeRange = LeaderboardTimeRange.ALL_TIME;
      const query = searchExampleAudioPronunciationsReviewedByUser({ uid, timeRange });

      expect(query).toEqual({
        pronunciations: {
          $elemMatch: {
            $or: [{ approvals: { $in: [uid] } }, { denials: { $in: [uid] } }],
          },
        },
      });
    });
    it('generates a query for week', () => {
      const uid = 'user-uid';
      const timeRange = LeaderboardTimeRange.WEEK;
      const query = searchExampleAudioPronunciationsReviewedByUser({ uid, timeRange });
      const startDate = moment().startOf('isoWeek').valueOf();
      const endDate = moment().endOf('isoWeek').valueOf();

      expect(query).toEqual({
        pronunciations: {
          $elemMatch: {
            $or: [{ approvals: { $in: [uid] } }, { denials: { $in: [uid] } }],
          },
        },
        updatedAt: { $gte: startDate, $lte: endDate },
      });
    });

    it('generates a query for month', () => {
      const uid = 'user-uid';
      const timeRange = LeaderboardTimeRange.MONTH;
      const query = searchExampleAudioPronunciationsReviewedByUser({ uid, timeRange });
      const startDate = moment().startOf('month').valueOf();
      const endDate = moment().endOf('month').valueOf();

      expect(query).toEqual({
        pronunciations: {
          $elemMatch: {
            $or: [{ approvals: { $in: [uid] } }, { denials: { $in: [uid] } }],
          },
        },
        updatedAt: { $gte: startDate, $lte: endDate },
      });
    });

    it('generates a query for igbo voice athon', () => {
      const uid = 'user-uid';
      const timeRange = LeaderboardTimeRange.IGBO_VOICE_ATHON;
      const query = searchExampleAudioPronunciationsReviewedByUser({ uid, timeRange });
      const startDate = moment('2023-07-24').valueOf();
      const endDate = moment('2023-10-24').valueOf();

      expect(query).toEqual({
        pronunciations: {
          $elemMatch: {
            $or: [{ approvals: { $in: [uid] } }, { denials: { $in: [uid] } }],
          },
        },
        updatedAt: { $gte: startDate, $lte: endDate },
      });
    });
  });

  describe('searchExampleAudioPronunciationsRecordedByUser', () => {
    it('generates a query for all time', () => {
      const uid = 'user-uid';
      const timeRange = LeaderboardTimeRange.ALL_TIME;
      const query = searchExampleAudioPronunciationsRecordedByUser({ uid, timeRange });

      expect(query).toEqual({
        pronunciations: {
          $elemMatch: { speaker: { $eq: uid } },
        },
      });
    });
    it('generates a query for week', () => {
      const uid = 'user-uid';
      const timeRange = LeaderboardTimeRange.WEEK;
      const startDate = moment().startOf('isoWeek').valueOf();
      const endDate = moment().endOf('isoWeek').valueOf();
      const query = searchExampleAudioPronunciationsRecordedByUser({ uid, timeRange });

      expect(query).toEqual({
        pronunciations: {
          $elemMatch: { speaker: { $eq: uid } },
        },
        updatedAt: { $gte: startDate, $lte: endDate },
      });
    });

    it('generates a query for month', () => {
      const uid = 'user-uid';
      const timeRange = LeaderboardTimeRange.MONTH;
      const startDate = moment().startOf('month').valueOf();
      const endDate = moment().endOf('month').valueOf();
      const query = searchExampleAudioPronunciationsRecordedByUser({ uid, timeRange });

      expect(query).toEqual({
        pronunciations: {
          $elemMatch: { speaker: { $eq: uid } },
        },
        updatedAt: { $gte: startDate, $lte: endDate },
      });
    });
    it('generates a query for igbo voice athon', () => {
      const uid = 'user-uid';
      const timeRange = LeaderboardTimeRange.IGBO_VOICE_ATHON;
      const startDate = moment('2023-07-24').valueOf();
      const endDate = moment('2023-10-24').valueOf();
      const query = searchExampleAudioPronunciationsRecordedByUser({ uid, timeRange });

      expect(query).toEqual({
        pronunciations: {
          $elemMatch: { speaker: { $eq: uid } },
        },
        updatedAt: { $gte: startDate, $lte: endDate },
      });
    });
  });
});
