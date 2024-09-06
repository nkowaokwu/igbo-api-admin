import { getResourceObjects, ResourceGroup } from 'src/App/Resources';
import UserRoles from 'src/backend/shared/constants/UserRoles';

describe('Resources', () => {
  it('gets resource objects as user', () => {
    const resourceObjects = getResourceObjects({ role: UserRoles.USER });

    expect(resourceObjects).toEqual([]);
  });
  it('gets resource objects as crowdsourcer', () => {
    const resourceObjects = getResourceObjects({ role: UserRoles.CROWDSOURCER });

    expect(resourceObjects).toMatchObject([{ name: '#', group: ResourceGroup.UNSPECIFIED }]);
  });
  it('gets resource objects as editor', () => {
    const resourceObjects = getResourceObjects({ role: UserRoles.EDITOR });

    expect(resourceObjects).toMatchObject([
      { name: '#', group: ResourceGroup.UNSPECIFIED },
      { name: 'stats', group: ResourceGroup.UNSPECIFIED },
      { name: 'words', group: ResourceGroup.LEXICAL },
      { name: 'examples', group: ResourceGroup.LEXICAL },
      { name: 'nsibidiCharacters', group: ResourceGroup.LEXICAL },
      { name: 'corpora', group: ResourceGroup.LEXICAL },
      { name: 'wordSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'exampleSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'corpusSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'polls', group: ResourceGroup.DATA_COLLECTION },
    ]);
  });
  it('gets resource objects as merger', () => {
    const resourceObjects = getResourceObjects({ role: UserRoles.MERGER });

    expect(resourceObjects).toMatchObject([
      { name: '#', group: ResourceGroup.UNSPECIFIED },
      { name: 'stats', group: ResourceGroup.UNSPECIFIED },
      { name: 'words', group: ResourceGroup.LEXICAL },
      { name: 'examples', group: ResourceGroup.LEXICAL },
      { name: 'nsibidiCharacters', group: ResourceGroup.LEXICAL },
      { name: 'corpora', group: ResourceGroup.LEXICAL },
      { name: 'wordSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'exampleSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'corpusSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'polls', group: ResourceGroup.DATA_COLLECTION },
    ]);
  });
  it('gets resource objects as nsibidi merger', () => {
    const resourceObjects = getResourceObjects({ role: UserRoles.NSIBIDI_MERGER });

    expect(resourceObjects).toMatchObject([
      { name: '#', group: ResourceGroup.UNSPECIFIED },
      { name: 'stats', group: ResourceGroup.UNSPECIFIED },
      { name: 'words', group: ResourceGroup.LEXICAL },
      { name: 'examples', group: ResourceGroup.LEXICAL },
      { name: 'nsibidiCharacters', group: ResourceGroup.LEXICAL },
      { name: 'corpora', group: ResourceGroup.LEXICAL },
      { name: 'wordSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'exampleSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'corpusSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'polls', group: ResourceGroup.DATA_COLLECTION },
    ]);
  });
  it('gets resource objects as admin', () => {
    const resourceObjects = getResourceObjects({ role: UserRoles.ADMIN });

    expect(resourceObjects).toMatchObject([
      { name: '#', group: ResourceGroup.UNSPECIFIED },
      { name: 'stats', group: ResourceGroup.UNSPECIFIED },
      { name: 'words', group: ResourceGroup.LEXICAL },
      { name: 'examples', group: ResourceGroup.LEXICAL },
      { name: 'nsibidiCharacters', group: ResourceGroup.LEXICAL },
      { name: 'corpora', group: ResourceGroup.LEXICAL },
      { name: 'wordSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'exampleSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'corpusSuggestions', group: ResourceGroup.DATA_COLLECTION },
      { name: 'polls', group: ResourceGroup.DATA_COLLECTION },
      { name: 'users', group: ResourceGroup.SETTINGS },
      { name: 'dataDump', group: ResourceGroup.DATA_COLLECTION },
      { name: 'textImages', group: ResourceGroup.DATA_COLLECTION },
      { name: 'igboTextImages', group: ResourceGroup.DATA_COLLECTION },
      { name: 'igboDefinitions', group: ResourceGroup.DATA_COLLECTION },
    ]);
  });
});
