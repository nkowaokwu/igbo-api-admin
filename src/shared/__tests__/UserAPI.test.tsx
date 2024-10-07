import Collection from 'src/shared/constants/Collection';
import {
  getUserExampleSuggestionRecordings,
  getUserExampleSuggestionTranslations,
  getUserProfile,
} from 'src/shared/UserAPI';
import * as request from '../utils/request';

const uid = 'uid';
describe('UserAPI', () => {
  it('gets the user project', async () => {
    const requestSpy = jest.spyOn(request, 'request');
    await getUserProfile(uid);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'GET',
      url: `${Collection.USERS}/${uid}`,
    });
  });

  it('gets user example suggestion recordings', async () => {
    const requestSpy = jest
      .spyOn(request, 'request')
      .mockResolvedValue({ data: { timestampedExampleSuggestions: [] } });
    await getUserExampleSuggestionRecordings(uid);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'GET',
      url: `${Collection.STATS}/users/${uid}/${Collection.EXAMPLE_SUGGESTIONS}/recorded`,
      params: { uid },
    });
  });

  it('get user example suggestion translations', async () => {
    const requestSpy = jest
      .spyOn(request, 'request')
      .mockResolvedValue({ data: { timestampedExampleSuggestions: [] } });
    await getUserExampleSuggestionTranslations(uid);
    expect(requestSpy).toHaveBeenCalledWith({
      method: 'GET',
      url: `${Collection.STATS}/users/${uid}/${Collection.EXAMPLE_SUGGESTIONS}/translated`,
      params: { uid },
    });
  });
});
