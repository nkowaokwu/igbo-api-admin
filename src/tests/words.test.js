import chai from 'chai';
import {

  forIn,
  isEqual,
  uniqBy,
  some,
} from 'lodash';
import {
  INVALID_ID,
  MESSAGE,
  INVALID_MESSAGE,
  AUTH_TOKEN,
} from './shared/constants';
import {
  exampleSuggestionData,
  wordSuggestionData,
  updatedWordData,
  updatedWordSuggestionData,
} from './__mocks__/documentData';
import {
  getWords,
  getWord,
  getWordSuggestion,
  getWordSuggestions,
  createWord,
  deleteWord,
  updateWord,
  suggestNewWord,
  getGenericWord,
  getGenericWords,
  updateGenericWord,
  sendSendGridEmail,
  updateWordSuggestion,
  getExample,
} from './shared/commands';
import { createWordFromSuggestion, createExampleFromSuggestion } from './shared/utils';

const { expect } = chai;

describe('MongoDB Words', function () {
  this.timeout(20000);
  /* Create a base wordSuggestion document */
  before((done) => {
    suggestNewWord(wordSuggestionData)
      .then(setTimeout(() => done(), 1000));
  });
  describe('/POST mongodb words', () => {
    this.timeout(20000);
    it('should create a new word in the database by merging wordSuggestion', (done) => {
      suggestNewWord(updatedWordSuggestionData)
        .then((res) => {
          expect(res.status).to.equal(200);
          const mergingWordSuggestion = { ...res.body, ...updatedWordSuggestionData };
          createWord(mergingWordSuggestion.id)
            .then((result) => {
              expect(result.status).to.equal(200);
              expect(result.body.id).to.not.equal(undefined);
              expect(result.body.authorId).to.equal(undefined);
              getWord(result.body.id)
                .then((updatedWordRes) => {
                  expect(updatedWordRes.status).to.equal(200);
                  getWordSuggestion(res.body.id)
                    .end((_, wordRes) => {
                      expect(wordRes.status).to.equal(200);
                      expect(wordRes.body.mergedBy).to.equal(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
                      expect(updatedWordRes.body.word).to.equal(wordRes.body.word);
                      expect(updatedWordRes.body.wordClass).to.equal(wordRes.body.wordClass);
                      expect(updatedWordRes.body.id).to.equal(wordRes.body.merged);
                      done();
                    });
                });
            });
        });
    });

    it('should create a new word in the database by merging genericWord', (done) => {
      getGenericWords()
        .then((res) => {
          expect(res.status).to.equal(200);
          const firstGenericWord = res.body[0];
          firstGenericWord.wordClass = 'something new';
          updateGenericWord(firstGenericWord)
            .then((saveMergedGenericWord) => {
              expect(saveMergedGenericWord.status).to.equal(200);
              createWord(firstGenericWord.id)
                .then((result) => {
                  expect(result.status).to.equal(200);
                  expect(result.body.id).to.not.equal(undefined);
                  getGenericWord(firstGenericWord.id)
                    .end((_, genericWordRes) => {
                      expect(genericWordRes.status).to.equal(200);
                      expect(genericWordRes.body.mergedBy).to.equal(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
                      expect(result.body.word).to.equal(genericWordRes.body.word);
                      expect(result.body.wordClass).to.equal(genericWordRes.body.wordClass);
                      expect(result.body.id).to.equal(genericWordRes.body.merged);
                      done();
                    });
                });
            });
        });
    });

    it('should throw an error from creating a new word from malformed genericWord', (done) => {
      getGenericWords()
        .then((res) => {
          expect(res.status).to.equal(200);
          const firstGenericWord = res.body[0];
          createWord(firstGenericWord.id)
            .end((_, result) => {
              expect(result.status).to.equal(400);
              expect(result.body.error).to.not.equal(undefined);
              done();
            });
        });
    });

    it('should merge into an existing word with new wordSuggestion', (done) => {
      suggestNewWord(wordSuggestionData)
        .then((res) => {
          expect(res.status).to.equal(200);
          getWords()
            .then((wordRes) => {
              const firstWord = wordRes.body[0];
              const mergingWordSuggestion = { ...res.body, originalExampleId: firstWord.id };
              createWord(mergingWordSuggestion.id)
                .then((result) => {
                  expect(result.status).to.equal(200);
                  expect(result.body.id).to.not.equal(undefined);
                  expect(result.body.authorId).to.equal(undefined);
                  getWord(result.body.id)
                    .then((updatedWordRes) => {
                      expect(updatedWordRes.status).to.equal(200);
                      getWordSuggestion(res.body.id)
                        .end((_, updatedWordSuggestionRes) => {
                          expect(updatedWordRes.status).to.equal(200);
                          expect(updatedWordSuggestionRes.body.mergedBy).to.equal(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
                          expect(updatedWordRes.body.word).to.equal(updatedWordSuggestionRes.body.word);
                          expect(updatedWordRes.body.wordClass).to.equal(updatedWordSuggestionRes.body.wordClass);
                          expect(updatedWordRes.body.id).to.equal(updatedWordSuggestionRes.body.merged);
                          done();
                        });
                    });
                });
            });
        });
    });

    it('should merge into an existing word with existing wordSuggestion', (done) => {
      getWordSuggestions()
        .then((res) => {
          expect(res.status).to.equal(200);
          const firstWordSuggestion = res.body[0];
          firstWordSuggestion.wordClass = 'wordClass';
          updateWordSuggestion(firstWordSuggestion)
            .then((updatedWordSuggestionRes) => {
              expect(updatedWordSuggestionRes.status).to.equal(200);
              createWord(updatedWordSuggestionRes.body.id)
                .then((wordRes) => {
                  expect(wordRes.status).to.equal(200);
                  expect(wordRes.body.word).to.equal(updatedWordSuggestionRes.body.word);
                  expect(wordRes.body.wordClass).to.equal(updatedWordSuggestionRes.body.wordClass);
                  getWordSuggestion(updatedWordSuggestionRes.body.id)
                    .end((_, wordSuggestionRes) => {
                      expect(wordSuggestionRes.status).to.equal(200);
                      expect(wordSuggestionRes.body.mergedBy).to.equal(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
                      expect(wordSuggestionRes.body.merged).to.equal(wordRes.body.id);
                      done();
                    });
                });
            });
        });
    });

    it('should merge into an existing word with genericWords', (done) => {
      getGenericWords()
        .then((res) => {
          expect(res.status).to.equal(200);
          const firstGenericWord = res.body[0];
          firstGenericWord.wordClass = 'wordClass';
          updateGenericWord(firstGenericWord)
            .then((updatedGenericWordRes) => {
              expect(updatedGenericWordRes.status).to.equal(200);
              createWord(updatedGenericWordRes.body.id)
                .then((wordRes) => {
                  expect(wordRes.status).to.equal(200);
                  expect(wordRes.body.word).to.equal(updatedGenericWordRes.body.word);
                  expect(wordRes.body.wordClass).to.equal(updatedGenericWordRes.body.wordClass);
                  getGenericWord(updatedGenericWordRes.body.id)
                    .end((_, genericWordRes) => {
                      expect(genericWordRes.status).to.equal(200);
                      expect(genericWordRes.body.mergedBy).to.equal(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
                      expect(genericWordRes.body.merged).to.equal(wordRes.body.id);
                      done();
                    });
                });
            });
        });
    });

    it('should throw error for merging an incomplete genericWord', (done) => {
      getGenericWords()
        .then((res) => {
          expect(res.status).to.equal(200);
          const firstGenericWord = res.body.find((genericWord) => !genericWord.wordClass) || res.body[0];
          getWords()
            .then((wordRes) => {
              const firstWord = wordRes.body[0];
              const mergingGenericWord = {
                ...firstGenericWord,
                wordClass: 'wordClass',
                originalWordId: firstWord.id,
              };
              createWord(mergingGenericWord.id)
                .end((_, result) => {
                  expect(result.status).to.equal(400);
                  expect(result.body.error).to.not.equal(undefined);
                  done();
                });
            });
        });
    });

    it('should send an email with valid message object', (done) => {
      sendSendGridEmail(MESSAGE)
        .then(() => done());
    });

    it('should return an error with invalid message object', (done) => {
      sendSendGridEmail(INVALID_MESSAGE)
        .catch(() => done());
    });

    it('should return a newly created word after merging with just an id', (done) => {
      suggestNewWord(wordSuggestionData)
        .then((res) => {
          createWord(res.body.id)
            .end((_, result) => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(undefined);
              done();
            });
        });
    });

    it('should return newly created word by searching with keyword', (done) => {
      suggestNewWord(wordSuggestionData)
        .then((res) => {
          const mergingWordSuggestion = { ...res.body, ...wordSuggestionData };
          createWord(mergingWordSuggestion.id)
            .then((result) => {
              expect(result.status).to.equal(200);
              expect(result.body.id).to.not.equal(undefined);
              getWords({ keyword: wordSuggestionData.word })
                .end((_, wordRes) => {
                  expect(wordRes.status).to.equal(200);
                  expect(some(wordRes.body, (word) => word.word === mergingWordSuggestion.word)).to.equal(true);
                  done();
                });
            });
        });
    });
  });

  describe('/PUT mongodb words', () => {
    it('should create a new word and update it', (done) => {
      suggestNewWord(wordSuggestionData)
        .then((res) => {
          const mergingWordSuggestion = { ...res.body, ...wordSuggestionData };
          createWord(mergingWordSuggestion.id)
            .then((result) => {
              expect(result.status).to.equal(200);
              expect(result.body.id).to.not.equal(undefined);
              updateWord({ id: result.body.id, ...updatedWordData })
                .end((_, updateWordRes) => {
                  expect(updateWordRes.status).to.equal(200);
                  forIn(updatedWordData, (value, key) => {
                    expect(isEqual(updateWordRes.body[key], value)).to.equal(true);
                    expect(new Date(result.body.updatedOn))
                      .to.be.lessThan(new Date(updateWordRes.body.updatedOn));
                  });
                  done();
                });
            });
        });
    });
  });

  describe('/DELETE mongodb words', () => {
    it('should delete the word document and move its contents to a new word with associated examples', (done) => {
      createWordFromSuggestion(updatedWordSuggestionData)
        .then((firstWord) => {
          createExampleFromSuggestion({ ...exampleSuggestionData, associatedWords: [firstWord.id] })
            .then((firstExample) => {
              createWordFromSuggestion({ ...updatedWordSuggestionData, word: 'combine into word' })
                .then((secondWord) => {
                  createExampleFromSuggestion({
                    ...exampleSuggestionData,
                    associatedWords: [firstWord.id, secondWord.id],
                  })
                    .then((secondExample) => {
                      expect(firstWord.id).to.not.be.oneOf([null, undefined, '']);
                      expect(secondWord.id).to.not.be.oneOf([null, undefined, '']);
                      deleteWord(firstWord.id, secondWord.id)
                        .then((combinedWordRes) => {
                          const { definitions, variations, stems } = combinedWordRes.body;
                          expect(combinedWordRes.status).to.equal(200);
                          expect(isEqual(definitions, uniqBy(definitions, (definition) => definition))).to.equal(true);
                          expect(isEqual(variations, uniqBy(variations, (variation) => variation))).to.equal(true);
                          expect(isEqual(stems, uniqBy(stems, (stem) => stem))).to.equal(true);
                          expect(definitions).to.have.include.members(firstWord.definitions);
                          expect(definitions).to.have.include.members(secondWord.definitions);
                          expect(variations).to.have.include.members(firstWord.variations);
                          expect(variations).to.have.include.members(secondWord.variations);
                          expect(stems).to.have.include.members(firstWord.stems);
                          expect(stems).to.have.include.members(secondWord.stems);
                          getExample(firstExample.id)
                            .then((firstExampleRes) => {
                              expect(firstExampleRes.status).to.equal(200);
                              getExample(secondExample.id)
                                .then((secondExampleRes) => {
                                  const { associatedWords: firstExampleAssociatedWords } = firstExampleRes.body;
                                  const { associatedWords: secondExampleAssociatedWords } = secondExampleRes.body;
                                  expect(secondExampleRes.status).to.equal(200);
                                  expect(firstExampleRes.body.associatedWords).to.include(combinedWordRes.body.id);
                                  expect(firstExampleRes.body.associatedWords).to.not.include(firstWord.id);
                                  expect(secondExampleRes.body.associatedWords).to.include(combinedWordRes.body.id);
                                  expect(secondExampleRes.body.associatedWords).to.not.include(firstWord.id);
                                  expect(isEqual(
                                    firstExampleAssociatedWords,
                                    uniqBy(firstExampleAssociatedWords, (associatedWord) => associatedWord),
                                  )).to.equal(true);
                                  expect(isEqual(
                                    secondExampleAssociatedWords,
                                    uniqBy(secondExampleAssociatedWords, (associatedWord) => associatedWord),
                                  )).to.equal(true);
                                  getWord(firstWord.id)
                                    .end((_, res) => {
                                      expect(res.status).to.equal(404);
                                      done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should return an error deleting a word with an invalid primary word id', (done) => {
      createWordFromSuggestion(updatedWordSuggestionData)
        .then((firstWord) => {
          expect(firstWord.id).to.not.be.oneOf([null, undefined, '']);
          deleteWord(firstWord.id, INVALID_ID)
            .end((_, combinedWordRes) => {
              expect(combinedWordRes.status).to.equal(400);
              expect(combinedWordRes.body.error).to.not.be.oneOf([undefined, null, '']);
              done();
            });
        });
    });

    it('should return an error deleting a word with an invalid secondary word id', (done) => {
      createWordFromSuggestion(updatedWordSuggestionData)
        .then((firstWord) => {
          expect(firstWord.id).to.not.be.oneOf([null, undefined, '']);
          deleteWord(INVALID_ID, firstWord.id)
            .then((combinedWordRes) => {
              expect(combinedWordRes.status).to.equal(400);
              expect(combinedWordRes.body.error).to.not.be.oneOf([null, undefined, '']);
              done();
            });
        });
    });

    it('should handle a word with a null stems field', (done) => {
      getWords({ range: '[0, 24]' })
        .then((wordsRes) => {
          expect(wordsRes.status).to.equal(200);
          const wordWithNullStems = wordsRes.body[0];
          createWordFromSuggestion({ ...updatedWordSuggestionData, stems: null })
            .then((firstWord) => {
              deleteWord(firstWord.id, wordWithNullStems.id)
                .then((combinedWordRes) => {
                  const { definitions, variations, stems } = combinedWordRes.body;
                  expect(combinedWordRes.status).to.equal(200);
                  expect(isEqual(definitions, uniqBy(definitions, (definition) => definition))).to.equal(true);
                  expect(isEqual(variations, uniqBy(variations, (variation) => variation))).to.equal(true);
                  expect(isEqual(stems, uniqBy(stems, (stem) => stem))).to.equal(true);
                  expect(definitions).to.have.include.members(firstWord.definitions);
                  expect(definitions).to.have.include.members(wordWithNullStems.definitions);
                  expect(variations).to.have.include.members(firstWord.variations);
                  expect(variations).to.have.include.members(wordWithNullStems.variations);
                  expect(stems).to.have.include.members(firstWord.stems);
                  expect(stems).to.have.include.members(wordWithNullStems.stems);
                  done();
                });
            });
        });
    });

    it('should delete all wordSuggestions that are associated with the combined word', (done) => {
      createWordFromSuggestion(updatedWordSuggestionData)
        .then((word) => {
          suggestNewWord({ ...wordSuggestionData, originalWordId: word.id })
            .then((wordSuggestionRes) => {
              suggestNewWord({ ...wordSuggestionData, originalWordId: word.id })
                .then((secondWordSuggestionRes) => {
                  expect(wordSuggestionRes.status).to.equal(200);
                  createWordFromSuggestion(updatedWordSuggestionData)
                    .then((secondWord) => {
                      suggestNewWord({ ...wordSuggestionData, originalWordId: secondWord.id })
                        .then((thirdWordSuggestionRes) => {
                          deleteWord(word.id, secondWord.id)
                            .then((combinedWordRes) => {
                              expect(combinedWordRes.status).to.equal(200);
                              getWordSuggestion(wordSuggestionRes.body.id)
                                .then((firstNonExistentWordSuggestionRes) => {
                                  expect(firstNonExistentWordSuggestionRes.status).to.equal(404);
                                  getWordSuggestion(secondWordSuggestionRes.body.id)
                                    .then((secondNonExistentWordSuggestionRes) => {
                                      expect(secondNonExistentWordSuggestionRes.status).to.equal(404);
                                      getWordSuggestion(thirdWordSuggestionRes.body.id)
                                        .then((thirdExistentWordSuggestionRes) => {
                                          expect(thirdExistentWordSuggestionRes.status).to.equal(200);
                                          expect(thirdExistentWordSuggestionRes.body.id).to.not.equal(undefined);
                                          done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
  });
});
