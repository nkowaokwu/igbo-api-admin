import { noop } from 'lodash';
import * as requestModule from 'src/shared/utils/request';
import * as uploadToS3 from 'src/shared/utils/uploadToS3';
import { v4 as uuidv4 } from 'uuid';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import Collections from 'src/shared/constants/Collection';
import {
  putAudioForRandomExampleSuggestions,
  putReviewForRandomExampleSuggestions,
  getRandomExampleSuggestionsToTranslate,
  putRandomExampleSuggestionsToTranslate,
  bulkUploadExampleSuggestions,
  postWordSuggestionsForIgboDefinitions,
  postTextImages,
  attachTextImages,
} from '../DataCollectionAPI';

describe('DataCollectionAPI', () => {
  const response = new Promise((resolve) => resolve({ data: 'success' }));
  it('sends a PUT request with putAudioForRandomExampleSuggestions with all pronunciations present', () => {
    const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue(response);
    const data = [
      { id: 'first id', pronunciation: 'first pronunciation' },
      { id: 'second id', pronunciation: 'second pronunciation' },
      { id: 'third id', pronunciation: 'third pronunciation' },
      { id: 'fourth id', pronunciation: 'fourth pronunciation' },
      { id: 'fifth id', pronunciation: 'fifth pronunciation' },
    ];
    putAudioForRandomExampleSuggestions(data);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'exampleSuggestions/random/audio',
      data,
    });
  });

  it('sends a PUT request with putAudioForRandomExampleSuggestions with some pronunciations present', () => {
    const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue(response);
    const data = [
      { id: 'first id', pronunciation: 'first pronunciation' },
      { id: 'second id', pronunciation: '' },
      { id: 'third id', pronunciation: '' },
      { id: 'fourth id', pronunciation: 'fourth pronunciation' },
      { id: 'fifth id', pronunciation: 'fifth pronunciation' },
    ];
    putAudioForRandomExampleSuggestions(data);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'exampleSuggestions/random/audio',
      data: [
        { id: 'first id', pronunciation: 'first pronunciation' },
        { id: 'second id' },
        { id: 'third id' },
        { id: 'fourth id', pronunciation: 'fourth pronunciation' },
        { id: 'fifth id', pronunciation: 'fifth pronunciation' },
      ],
    });
  });

  it('sends a PUT request with putAudioForRandomExampleSuggestions with no pronunciations present', () => {
    const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue(response);
    const data = [
      { id: 'first id', pronunciation: '' },
      { id: 'second id', pronunciation: '' },
      { id: 'third id', pronunciation: '' },
      { id: 'fourth id', pronunciation: '' },
      { id: 'fifth id', pronunciation: '' },
    ];
    putAudioForRandomExampleSuggestions(data);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'exampleSuggestions/random/audio',
      data: [{ id: 'first id' }, { id: 'second id' }, { id: 'third id' }, { id: 'fourth id' }, { id: 'fifth id' }],
    });
  });

  it('sends a PUT request with putReviewForRandomExampleSuggestions with all reviews', () => {
    const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue(response);
    const data = [
      { id: 'first id', review: ReviewActions.APPROVE },
      { id: 'second id', review: ReviewActions.DENY },
      { id: 'third id', review: ReviewActions.SKIP },
      { id: 'fourth id', review: ReviewActions.APPROVE },
      { id: 'fifth id', review: ReviewActions.APPROVE },
    ];
    putReviewForRandomExampleSuggestions(data);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'exampleSuggestions/random/review',
      data: [
        { id: 'first id', review: ReviewActions.APPROVE },
        { id: 'second id', review: ReviewActions.DENY },
        { id: 'third id', review: ReviewActions.SKIP },
        { id: 'fourth id', review: ReviewActions.APPROVE },
        { id: 'fifth id', review: ReviewActions.APPROVE },
      ],
    });
  });

  it('sends a GET request with getRandomExampleSuggestionsToTranslate', async () => {
    const requestSpy = jest.spyOn(requestModule, 'request');
    await getRandomExampleSuggestionsToTranslate();
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'GET',
      url: 'exampleSuggestions/random/translate',
      params: {
        range: '[0, 4]',
      },
    });
  });

  it('sends a PUT request with putRandomExampleSuggestionsToTranslate', async () => {
    const requestSpy = jest.spyOn(requestModule, 'request');
    await putRandomExampleSuggestionsToTranslate([]);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'exampleSuggestions/random/translate',
      data: [],
    });
  });

  it('sends a POST request to dump example suggestions', async () => {
    const requestSpy = jest.spyOn(requestModule, 'request');
    const payload = {
      sentences: [
        { igbo: `igbo-${uuidv4()}`, origin: SuggestionSourceEnum.IGBO_SPEECH },
        { igbo: `igbo-${uuidv4()}`, origin: SuggestionSourceEnum.IGBO_SPEECH },
        { igbo: `igbo-${uuidv4()}`, origin: SuggestionSourceEnum.IGBO_SPEECH },
        { igbo: `igbo-${uuidv4()}`, origin: SuggestionSourceEnum.IGBO_SPEECH },
      ],
    };
    // @ts-expect-error
    await bulkUploadExampleSuggestions(payload, noop, noop);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'POST',
      url: 'exampleSuggestions/upload',
      data: payload.sentences,
    });
  });

  it('sends a POST request to suggest new word suggestions with Igbo definitions', async () => {
    const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
    const payload = { limit: 7 };
    await postWordSuggestionsForIgboDefinitions(payload);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'POST',
      url: `${Collections.WORD_SUGGESTIONS}/igbo-definitions`,
      data: payload,
    });
  });

  it('sends a POST request to create new text images', async () => {
    const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
    const textImagesPayload = [{ igbo: 'igbo' }];
    await postTextImages(textImagesPayload);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'POST',
      url: `${Collections.TEXT_IMAGES}`,
      data: textImagesPayload,
    });
  });

  it('sends a request to S3 to attach text images to images', async () => {
    const uploadToS3Spy = jest.spyOn(uploadToS3, 'default').mockReturnValue({});
    const textImagesPayload = [{ id: 'igbo', file: new File([], '') }];
    await attachTextImages(textImagesPayload);
    expect(uploadToS3Spy).toHaveBeenCalledWith({
      collection: Collections.TEXT_IMAGES,
      data: textImagesPayload[0],
    });
  });
});
