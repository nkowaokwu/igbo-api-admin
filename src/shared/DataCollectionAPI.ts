/* API for the Data Collection for IgboSpeech */
import { BULK_UPLOAD_LIMIT } from 'src/Core/constants';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import request from './utils/request';

export const getRandomExampleSuggestions = (
  count = 5,
): Promise<any> => request({
  method: 'GET',
  url: 'exampleSuggestions/random',
  params: {
    range: `[0, ${count - 1}]`,
  },
});

export const getRandomExampleSuggestionsToReview = (
  count = 5,
): Promise<any> => request({
  method: 'GET',
  url: 'exampleSuggestions/random/review',
  params: {
    range: `[0, ${count - 1}]`,
  },
});

export const putRandomExampleSuggestions = (rawData: {
  id: any,
  pronunciation?: string,
  review?: ReviewActions,
}[]): Promise<any> => {
  const data = rawData.map(({ pronunciation, ...rest }) => ({
    ...rest,
    ...(pronunciation ? { pronunciation } : {}),
  }));
  return request({
    method: 'PUT',
    url: 'exampleSuggestions/random',
    data,
  });
};

export const bulkUploadExampleSuggestions = async (
  payload: { sentences: { igbo: string }[], isExample: boolean },
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
  const result = await dataChunks.reduce((chain, dataChunk) => (
    chain
      .then(() => (
        request({
          method: 'POST',
          url: isExample ? 'examples/upload' : 'exampleSuggestions/upload',
          data: dataChunk,
        })
      ))
      .then(({ data }) => onProgressSuccess(data))
      .catch(onProgressFailure)
  ), Promise.resolve());
  console.timeEnd(`Bulk upload time for ${dataChunks.length} chunks`);
  return result;
};

export const getTotalRecordedExampleSuggestions = async (uid?: string): Promise<any> => (await request({
  method: 'GET',
  url: 'exampleSuggestions/random/stats/recorded',
  params: { uid },
})).data;

export const getTotalVerifiedExampleSuggestions = async (uid?: string | null): Promise<any> => (await request({
  method: 'GET',
  url: 'exampleSuggestions/random/stats/verified',
  params: uid ? { uid } : {},
})).data;
