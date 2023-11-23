import moment from 'moment';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';

const LeaderboardTimeRanges = {
  [LeaderboardTimeRange.ALL_TIME]: {
    startDate: null,
    endDate: null,
  },
  [LeaderboardTimeRange.WEEK]: {
    startDate: moment().startOf('isoWeek').valueOf(),
    endDate: moment().endOf('isoWeek').valueOf(),
  },
  [LeaderboardTimeRange.MONTH]: {
    startDate: moment().startOf('month').valueOf(),
    endDate: moment().endOf('month').valueOf(),
  },
  [LeaderboardTimeRange.IGBO_VOICE_ATHON]: {
    startDate: moment('2023-07-24').valueOf(),
    endDate: moment('2023-10-24').valueOf(),
  },
};

export const searchExampleAudioPronunciationsReviewedByUser = ({
  uid,
  timeRange = LeaderboardTimeRange.ALL_TIME,
}: {
  uid: string;
  timeRange?: LeaderboardTimeRange;
}): {
  pronunciations: {
    $elemMatch: {
      $or: { [key: string]: { $in: [string] } }[];
    };
  };
  updatedAt?: { $gte: number | null; $lte: number | null };
} => {
  const { startDate, endDate } = LeaderboardTimeRanges[timeRange];
  return {
    pronunciations: {
      $elemMatch: {
        $or: [{ approvals: { $in: [uid] } }, { denials: { $in: [uid] } }],
      },
    },
    ...(startDate ? { updatedAt: { $gte: startDate, $lte: endDate } } : {}),
  };
};
export const searchExampleSuggestionTranslatedByUser = ({
  uid,
  timeRange,
}: {
  uid: string;
  timeRange?: LeaderboardTimeRange;
}): {
  userInteractions: { $in: [string] };
  updatedAt?: { $gte: number | null; $lte: number | null };
} => {
  const { startDate, endDate } = LeaderboardTimeRanges[timeRange] || { startDate: null, endDate: null };
  return {
    userInteractions: { $in: [uid] },
    ...(startDate ? { updatedAt: { $gte: startDate, $lte: endDate } } : {}),
  };
};

/**
 * Generates query for getting all example suggestions that has
 * the current user's recording for a specified time range
 * @param uid
 * @returns
 */
export const searchExampleAudioPronunciationsRecordedByUser = ({
  uid,
  timeRange,
}: {
  uid: string;
  timeRange?: LeaderboardTimeRange;
}): {
  pronunciations: {
    $elemMatch: { [key: string]: { $eq: string } };
  };
  updatedAt?: { $gte: number | null; $lte: number | null };
} => {
  const { startDate, endDate } = LeaderboardTimeRanges[timeRange] || { startDate: null, endDate: null };
  return {
    pronunciations: {
      $elemMatch: { speaker: { $eq: uid } },
    },
    ...(startDate ? { updatedAt: { $gte: startDate, $lte: endDate } } : {}),
  };
};
