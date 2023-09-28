import {
  bulkDeleteDocuments,
  deleteOldWordSuggestions,
  getExample,
  getExamples,
  getExampleSuggestions,
} from 'src/shared/API';
import * as requestModule from 'src/shared/utils/request';
import Collection from 'src/shared/constants/Collection';

describe('API', () => {
  beforeEach(() => jest.clearAllMocks());
  describe('Word Suggestions', () => {
    it('sends a DELETE request to delete all old word suggestions', async () => {
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await deleteOldWordSuggestions();
      expect(requestSpy).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `${Collection.WORD_SUGGESTIONS}/old`,
      });
    });

    it('sends a DELETE request to bulk delete word suggestions', async () => {
      const ids = ['id'];
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await bulkDeleteDocuments({ resource: Collection.WORD_SUGGESTIONS, ids });
      expect(requestSpy).toHaveBeenLastCalledWith({
        method: 'DELETE',
        url: `${Collection.WORD_SUGGESTIONS}`,
        data: ids,
      });
    });
  });

  describe('Examples', () => {
    it('sends a GET request to get an example sentence', async () => {
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await getExample('id');
      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: `${Collection.EXAMPLES}/id`,
      });
    });
    it('sends a GET request to get example sentences', async () => {
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await getExamples('id');
      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: `${Collection.EXAMPLES}?keyword=id`,
      });
    });
    it('sends a GET request to get example suggestions', async () => {
      const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
      await getExampleSuggestions('word');
      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: `${Collection.EXAMPLE_SUGGESTIONS}?keyword=word`,
      });
    });
  });
});
