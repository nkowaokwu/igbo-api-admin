/* API for the Data Collection for IgboSpeech */
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { UserRanking } from 'src/backend/controllers/utils/interfaces';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import { request } from './utils/request';

interface ExampleAudioPayload {
  id: string;
  pronunciation: string | undefined;
}
interface ExampleReviewsPayload {
  id: any;
  reviews: { [pronunciationId: string]: ReviewActions };
}

export const getRandomExampleSuggestions = (count = 5): Promise<any> =>
  request({
    method: 'GET',
    url: 'exampleSuggestions/random',
    params: {
      range: `[0, ${count - 1}]`,
    },
  });

export const getRandomExampleSuggestionsToReview = (count = 5): Promise<any> =>
  request({
    method: 'GET',
    url: 'exampleSuggestions/random/review',
    params: {
      range: `[0, ${count - 1}]`,
    },
  });

export const putAudioForRandomExampleSuggestions = (rawData: ExampleAudioPayload[]): Promise<any> => {
  const data = rawData.map(({ pronunciation, ...rest }) => ({
    ...rest,
    ...(pronunciation ? { pronunciation } : {}),
  }));
  return request({
    method: 'PUT',
    url: 'exampleSuggestions/random/audio',
    data,
  });
};

export const putReviewForRandomExampleSuggestions = (data: ExampleReviewsPayload[]): Promise<any> =>
  request({
    method: 'PUT',
    url: 'exampleSuggestions/random/review',
    data,
  });

export const bulkUploadExampleSuggestions = async (
  payload: { sentences: { igbo: string }[]; isExample: boolean },
  onProgressSuccess: (value: any) => void,
  onProgressFailure: (err: Error) => void,
): Promise<any> => {
  const { sentences, isExample } = payload;
  let chunkIndex = 0;
  const groupSize = BULK_UPLOAD_LIMIT;
  const dataChunks = [];
  while (chunkIndex < sentences.length) {
    const chunkStart = chunkIndex;
    const chunkEnd = chunkIndex + groupSize >= sentences.length ? sentences.length : chunkIndex + groupSize;
    const dataChunk = sentences.slice(chunkStart, chunkEnd);
    dataChunks.push(dataChunk);
    chunkIndex += groupSize;
  }
  console.time(`Bulk upload time for ${dataChunks.length} chunks`);
  const result = await dataChunks.reduce(
    (chain, dataChunk) =>
      chain
        .then(() =>
          request({
            method: 'POST',
            url: isExample ? 'examples/upload' : 'exampleSuggestions/upload',
            data: dataChunk,
          }),
        )
        .then(({ data }) => onProgressSuccess(data))
        .catch(onProgressFailure),
    Promise.resolve(),
  );
  console.timeEnd(`Bulk upload time for ${dataChunks.length} chunks`);
  return result;
};

export const getTotalRecordedExampleSuggestions = async (uid?: string): Promise<any> =>
  (
    await request({
      method: 'GET',
      url: 'exampleSuggestions/random/stats/recorded',
      params: { uid },
    })
  ).data;

export const getTotalVerifiedExampleSuggestions = async (uid?: string | null): Promise<any> =>
  (
    await request({
      method: 'GET',
      url: 'exampleSuggestions/random/stats/verified',
      params: uid ? { uid } : {},
    })
  ).data;

export const getLeaderboardStats = async ({
  leaderboard,
  timeRange,
}: {
  leaderboard: LeaderboardType;
  timeRange: LeaderboardTimeRange;
}): Promise<{
  userRanking: UserRanking;
  rankings: UserRanking[];
}> =>
  (
    await request({
      method: 'GET',
      url: 'leaderboard',
      params: { leaderboard, timeRange },
    })
  ).data;
