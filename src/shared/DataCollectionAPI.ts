/* API for the Data Collection for IgboSpeech */
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { ExampleSuggestion, Translation, UserRanking } from 'src/backend/controllers/utils/interfaces';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import Collections from 'src/shared/constants/Collection';
import { DataPayload } from 'src/backend/controllers/utils/types/mediaTypes';
import uploadToS3 from 'src/shared/utils/uploadToS3';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import {
  SentenceTranslationPayload,
  SentenceTranslationVerificationPayload,
} from 'src/Core/Collections/IgboSoundbox/types/SoundboxInterfaces';
import { request } from './utils/request';

interface ExampleAudioPayload {
  id: string;
  pronunciation: string | undefined;
}
interface ExampleReviewsPayload {
  id: any;
  reviews: { [pronunciationId: string]: ReviewActions };
}

export const getRandomExampleSuggestionsToTranslate = async (count = 5): Promise<ExampleSuggestion[]> => {
  const { data: result } = await request<{ exampleSuggestions: ExampleSuggestion[] }>({
    method: 'GET',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/translate`,
    params: {
      range: `[0, ${count - 1}]`,
    },
  });
  return result.exampleSuggestions;
};

export const putRandomExampleSuggestionsToTranslate = (rawData: SentenceTranslationPayload[]): Promise<any> =>
  request({
    method: 'PUT',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/translate`,
    data: rawData,
  }).catch((err) => {
    throw new Error(err.response.data.error);
  });

export const getRandomExampleSuggestionForTranslationReview = async (count = 5): Promise<ExampleSuggestion[]> => {
  const { data: result } = await request<{ exampleSuggestions: ExampleSuggestion[] }>({
    method: 'GET',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/translate/review`,
    params: {
      range: `[0, ${count - 1}]`,
    },
  });
  return result.exampleSuggestions;
};

export const putRandomExampleSuggestionReviewsForTranslation = async (
  data: SentenceTranslationVerificationPayload[],
): Promise<ExampleSuggestion[]> => {
  const { data: result } = await request<{ exampleSuggestions: ExampleSuggestion[] }>({
    method: 'PUT',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/translate/review`,
    data,
  });
  return result.exampleSuggestions;
};

export const getRandomExampleSuggestionsToRecord = (
  { count = 5, languages }: { count?: number; languages: LanguageEnum[] } = { count: 5, languages: [] },
): Promise<any> =>
  request({
    method: 'GET',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/audio?languages=${languages}`,
    params: {
      range: `[0, ${count - 1}]`,
    },
  });

export const getRandomExampleSuggestionsToReview = ({ count = 5 }: { count?: number } = { count: 5 }): Promise<any> =>
  request({
    method: 'GET',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/review`,
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
    url: `${Collections.EXAMPLE_SUGGESTIONS}/audio`,
    data,
  });
};

export const putReviewForRandomExampleSuggestions = (data: ExampleReviewsPayload[]): Promise<any> =>
  request({
    method: 'PUT',
    url: `${Collections.EXAMPLE_SUGGESTIONS}/review`,
    data,
  });

export const bulkUploadExampleSuggestions = async (
  payload: { sentences: { source: Pick<Translation, 'text' | 'language'> }[]; isExample: boolean },
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
  return result;
};

export const getTotalReviewedExampleSuggestions = async (
  uid?: string | null,
): Promise<{ timestampedReviewedExampleSuggestions: { [key: string]: number } }> =>
  (
    await request({
      method: 'GET',
      url: `${Collections.EXAMPLE_SUGGESTIONS}/random/stats/reviewed`,
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

export const exportData = async (): Promise<boolean> => {
  const { data: result } = await request<{ success: boolean }>({ method: 'POST', url: 'exports' });
  return result.success;
};
