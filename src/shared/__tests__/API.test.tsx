import { deleteOldWordSuggestions, getExample, getExamples, getExampleSuggestions } from 'src/shared/API';
import * as requestModule from 'src/shared/utils/request';
import Collections from 'src/shared/constants/Collection';

describe('API', () => {
  beforeEach(() => jest.clearAllMocks());
  describe('Word Suggestions', () => {
    it('sends a DELETE request to delete all old word suggestions', async () => {
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await deleteOldWordSuggestions();
      expect(requestSpy).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `${Collections.WORD_SUGGESTIONS}/old`,
      });
    });
  });

  describe('Examples', () => {
    it('sends a GET request to get an example sentence', async () => {
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await getExample('id');
      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: `${Collections.EXAMPLES}/id`,
      });
    });
    it('sends a GET request to get example sentences', async () => {
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await getExamples('id');
      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: `${Collections.EXAMPLES}?keyword=id`,
      });
    });
    it('sends a GET request to get example suggestions', async () => {
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await getExampleSuggestions('word');
      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: `${Collections.EXAMPLE_SUGGESTIONS}?keyword=word`,
      });
    });
  });
});
