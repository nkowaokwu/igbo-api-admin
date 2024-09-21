import { cloneDeep } from 'lodash';
import Author from 'src/backend/shared/constants/Author';
import automaticallyMergeExampleSuggestion from 'src/backend/controllers/utils/automaticallyMergeExampleSuggestion';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import * as exampleModule from '../../examples';

describe('automaticallyMergeExampleSuggestion', () => {
  const topLevelExampleSuggestion = {
    exampleForSuggestion: false,
    approvals: ['first user', 'second user'],
    pronunciations: [
      {
        audio: 'first audio',
        speaker: 'first user',
        review: true,
        approvals: ['first user', 'second user'],
        denials: [],
      },
      {
        audio: 'second audio',
        speaker: 'first user',
        review: true,
        approvals: ['first user', 'second user'],
        denials: [],
      },
    ],
  };
  const mockExecuteMergeExample = jest
    .spyOn(exampleModule, 'executeMergeExample')
    // @ts-expect-error
    .mockReturnValue(topLevelExampleSuggestion);

  beforeEach(() => {
    mockExecuteMergeExample.mockReset();
  });

  it('merges the exampleSuggestion into a new example', async () => {
    const exampleSuggestion = cloneDeep({
      ...topLevelExampleSuggestion,
      origin: SuggestionSourceEnum.BBC,
      type: SentenceTypeEnum.DATA_COLLECTION,
    });
    const mongooseConnection = {};
    // @ts-expect-error
    await automaticallyMergeExampleSuggestion({ exampleSuggestion, mongooseConnection });
    expect(mockExecuteMergeExample).toHaveBeenCalledWith(exampleSuggestion, Author.SYSTEM, mongooseConnection);
  });
  it('does not merge the exampleSuggestion due to being an exampleForSuggestion', async () => {
    const exampleSuggestion = cloneDeep(topLevelExampleSuggestion);
    exampleSuggestion.exampleForSuggestion = true;
    const mongooseConnection = {};
    // @ts-expect-error
    await automaticallyMergeExampleSuggestion({ exampleSuggestion, mongooseConnection });
    expect(mockExecuteMergeExample).not.toHaveBeenCalled();
  });
  it('does not merge the exampleSuggestion due to not having enough approvals', async () => {
    const exampleSuggestion = cloneDeep(topLevelExampleSuggestion);
    exampleSuggestion.approvals = ['first user'];
    const mongooseConnection = {};
    // @ts-expect-error
    await automaticallyMergeExampleSuggestion({ exampleSuggestion, mongooseConnection });
    expect(mockExecuteMergeExample).not.toHaveBeenCalled();
  });
  it('does not merge the exampleSuggestion due one pronunciation not having enough approvals', async () => {
    const exampleSuggestion = cloneDeep(topLevelExampleSuggestion);
    exampleSuggestion.pronunciations[0].approvals = ['first user'];
    const mongooseConnection = {};
    // @ts-expect-error
    await automaticallyMergeExampleSuggestion({ exampleSuggestion, mongooseConnection });
    expect(mockExecuteMergeExample).not.toHaveBeenCalled();
  });
});
