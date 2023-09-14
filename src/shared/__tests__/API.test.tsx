import { deleteOldWordSuggestions } from 'src/shared/API';
import * as requestModule from 'src/shared/utils/request';
import Collections from 'src/shared/constants/Collections';

describe('API', () => {
  it('sends a DELETE request to delete all old word suggestions', async () => {
    const requestSpy = jest.spyOn(requestModule, 'request').mockReturnValue({});
    await deleteOldWordSuggestions();
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'DELETE',
      url: `${Collections.WORD_SUGGESTIONS}/old`,
    });
  });
});
