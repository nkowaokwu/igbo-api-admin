/* API for the Data Collection for IgboSpeech */
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { UserRanking } from 'src/backend/controllers/utils/interfaces';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import Collections from 'src/shared/constants/Collection';
import { DataPayload } from 'src/backend/controllers/utils/types/mediaTypes';
import uploadToS3 from 'src/shared/utils/uploadToS3';
import { request } from './utils/request';

interface ExampleAudioPayload {
  id: string;
  pronunciation: string | undefined;
}
interface ExampleReviewsPayload {
  id: any;
  reviews: { [pronunciationId: string]: ReviewActions };
}
interface TranslationPayload {
  id: string;
  english: string;
}

export const getRandomExampleSuggestionsToTranslate = (count = 5): Promise<any> =>
  request({
    method: 'GET',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/random/translate`,
    params: {
      range: `[0, ${count - 1}]`,
    },
  });
export const putRandomExampleSuggestionsToTranslate = (rawData: TranslationPayload[]): Promise<any> =>
  request({
    method: 'PUT',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/random/translate`,
    data: rawData,
  });

export const getRandomExampleSuggestionsToRecord = (count = 5): Promise<any> =>
  request({
    method: 'GET',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/random/audio`,
    params: {
      range: `[0, ${count - 1}]`,
    },
  });

export const getRandomExampleSuggestionsToReview = (count = 5): Promise<any> =>
  request({
    method: 'GET',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/random/review`,
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
    url: `${Collections.EXAMPLE_SUGGESTIONS}/random/audio`,
    data,
  });
};

export const putReviewForRandomExampleSuggestions = (data: ExampleReviewsPayload[]): Promise<any> =>
  request({
    method: 'PUT',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/random/review`,
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
            url: `${isExample ? Collections.EXAMPLES : Collections.EXAMPLE_SUGGESTIONS}/upload`,
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

export const getTotalRecordedExampleSuggestions = async (
  uid?: string,
): Promise<{ timestampedExampleSuggestions: { [key: string]: number } }> =>
  (
    await request({
      method: 'GET',
      url: `${Collections.EXAMPLE_SUGGESTIONS}/random/stats/recorded`,
      params: { uid },
    })
  ).data;

export const getTotalVerifiedExampleSuggestions = async (uid?: string | null): Promise<any> =>
  (
    await request({
      method: 'GET',
      url: `${Collections.EXAMPLE_SUGGESTIONS}/random/stats/verified`,
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
}> => {
  await request({
    method: 'POST',
    url: 'referral',
    params: { 'referral-code': '86HFJM' },
  });

  return (
    await request({
      method: 'GET',
      url: 'leaderboard',
      params: { leaderboard, timeRange },
    })
  ).data;
};

export const postWordSuggestionsForIgboDefinitions = async (data: { limit: number }): Promise<{ message: string }> =>
  (await request({ method: 'POST', url: `${Collections.WORD_SUGGESTIONS}/igbo-definitions`, data })).data;

/* Text Images */
export const postTextImages = async (data: { igbo: string }[]): Promise<{ id: string; igbo: string }[]> =>
  (await request({ method: 'POST', url: `${Collections.TEXT_IMAGES}`, data })).data;

export const attachTextImages = async (data: DataPayload[]): Promise<{ id: string; result: string | void }[]> => {
  const result = await Promise.all(
    data.map(async (payload) => {
      const result = await uploadToS3({ collection: Collections.TEXT_IMAGES, data: payload });
      return { id: payload.id, result };
    }),
  );
  return result;
};
