// eslint-disable-next-line
import {
  difference,
  forEach,
  map,
  every,
  isEqual,
} from 'lodash';
import SortingDirections from 'src/backend/shared/constants/sortingDirections';
import {
  suggestNewWord,
  suggestNewExample,
  createWord,
  createExample,
  getWord,
} from './commands';

const expectUniqSetsOfResponses = (res: any, responseLength = 10): void => {
  forEach(res, (docsRes, index) => {
    expect(docsRes.status).toEqual(200);
    expect(docsRes.body.length).toBeLessThanOrEqual(responseLength);
    if (!index) {
      const prevDocsIds = map(res[index].body, ({ id }) => ({ id }));
      const currentDocsIds = map(docsRes.body, ({ id }) => ({ id }));
      expect(difference(prevDocsIds, currentDocsIds)).toHaveLength(prevDocsIds.length);
    }
  });
};

const expectArrayIsInOrder = (array: [], key: string, direction = SortingDirections.ASCENDING): void => {
  const isOrdered = every(map(array, (item) => item[key]), (value, index) => {
    if (index === 0) {
      return true;
    }
    return (
      direction === SortingDirections.ASCENDING
        ? String(array[index - 1][key] <= String(value))
        : String(array[index - 1][key] >= String(value))
    );
  });
  expect(isOrdered).toEqual(true);
};

const createWordFromSuggestion = async (wordSuggestionData: any): Promise<any> => {
  const res = await suggestNewWord(wordSuggestionData);
  expect(res.status).toEqual(200);
  const mergingWordSuggestion = { ...res.body, ...wordSuggestionData };
  const result = await createWord(mergingWordSuggestion.id);
  expect(result.status).toEqual(200);
  expect(result.body.id).not.toEqual(undefined);
  expect(result.body.authorId).toEqual(undefined);
  const wordRes = await getWord(result.body.id);
  expect(wordRes.status).toEqual(200);
  return wordRes.body;
};

const createExampleFromSuggestion = async (exampleSuggestionData: any): Promise<any> => {
  const exampleSuggestionRes = await suggestNewExample(exampleSuggestionData);
  expect(exampleSuggestionRes.status).toEqual(200);
  const finalRes = await createExample(exampleSuggestionRes.body.id);
  expect(isEqual(
    exampleSuggestionRes.body.associatedWords,
    finalRes.body.associatedWords,
  )).toEqual(true);
  return finalRes.body;
};

export {
  expectUniqSetsOfResponses,
  expectArrayIsInOrder,
  createWordFromSuggestion,
  createExampleFromSuggestion,
};
