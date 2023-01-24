/* API for the Data Collection for IgboSpeech */
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

export const putRandomExampleSuggestions = (data: {
  id: any,
  pronunciation?: string,
  review?: ReviewActions,
}[]): Promise<any> => request({
  method: 'PUT',
  url: 'exampleSuggestions/random',
  data,
});
