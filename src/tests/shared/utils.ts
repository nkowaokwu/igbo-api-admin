// eslint-disable-next-line
import chai from 'chai';
import {
  difference,
  forEach,
  map,
  every,
  isEqual,
} from 'lodash';
import {
  suggestNewWord,
  suggestNewExample,
  createWord,
  createExample,
  getWord,
} from './commands';
import SortingDirections from '../../backend/shared/constants/sortingDirections';

const { expect } = chai;

const expectUniqSetsOfResponses = (res: any, responseLength = 10): void => {
  forEach(res, (docsRes, index) => {
    expect(docsRes.status).to.equal(200);
    expect(docsRes.body).to.have.lengthOf.at.most(responseLength);
    if (!index) {
      const prevDocsIds = map(res[index].body, ({ id }) => ({ id }));
      const currentDocsIds = map(docsRes.body, ({ id }) => ({ id }));
      expect(difference(prevDocsIds, currentDocsIds)).to.have.lengthOf(prevDocsIds.length);
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
  expect(isOrdered).to.equal(true);
};

const createWordFromSuggestion = (wordSuggestionData: any): Promise<any> => (
  suggestNewWord(wordSuggestionData)
    .then((res) => {
      expect(res.status).to.equal(200);
      const mergingWordSuggestion = { ...res.body, ...wordSuggestionData };
      return createWord(mergingWordSuggestion.id)
        .then((result) => {
          expect(result.status).to.equal(200);
          expect(result.body.id).to.not.equal(undefined);
          expect(result.body.authorId).to.equal(undefined);
          return getWord(result.body.id)
            .then((wordRes) => {
              expect(wordRes.status).to.equal(200);
              return wordRes.body;
            });
        })
        .catch(() => {});
    })
);

const createExampleFromSuggestion = (exampleSuggestionData: any): Promise<any> => (
  suggestNewExample(exampleSuggestionData)
    .then((exampleSuggestionRes) => {
      expect(exampleSuggestionRes.status).to.equal(200);
      return createExample(exampleSuggestionRes.body.id)
        .then((finalRes) => {
          expect(isEqual(
            exampleSuggestionRes.body.associatedWords,
            finalRes.body.associatedWords,
          )).to.equal(true);
          return finalRes.body;
        });
    })
);

export {
  expectUniqSetsOfResponses,
  expectArrayIsInOrder,
  createWordFromSuggestion,
  createExampleFromSuggestion,
};
