import chai from 'chai';
import { isEqual, forIn, some } from 'lodash';
import {
  createExample,
  getExamples,
  getExample,
  updateExample,
  suggestNewExample,
  getExampleSuggestion,
  getExampleSuggestions,
} from './shared/commands';
import { AUTH_TOKEN } from './shared/constants';
import {
  exampleData,
  exampleSuggestionData,
  malformedExampleSuggestionData,
  updatedExampleData,
} from './__mocks__/documentData';

const { expect } = chai;

describe('MongoDB Examples', () => {
  /* Create a baseexampleSuggestion document */
  before((done) => {
    suggestNewExample(exampleSuggestionData)
      .then(setTimeout(() => done(), 1000));
  });
  describe('/POST mongodb examples', () => {
    it('should create a new example in the database', (done) => {
      suggestNewExample(exampleSuggestionData)
        .then((res) => {
          expect(res.status).to.equal(200);
          const mergingExampleSuggestion = { ...res.body, ...exampleSuggestionData };
          createExample(mergingExampleSuggestion.id)
            .then((result) => {
              expect(result.status).to.equal(200);
              expect(result.body.id).to.not.equal(undefined);
              expect(result.body.authorId).to.equal(undefined);
              getExample(result.body.id)
                .then((updatedExampleRes) => {
                  expect(updatedExampleRes.status).to.equal(200);
                  getExampleSuggestion(res.body.id)
                    .end((_, exampleRes) => {
                      expect(exampleRes.status).to.equal(200);
                      expect(exampleRes.body.mergedBy).to.equal(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
                      expect(updatedExampleRes.body.igbo).to.equal(exampleRes.body.igbo);
                      expect(updatedExampleRes.body.english).to.equal(exampleRes.body.english);
                      expect(updatedExampleRes.body.id).to.equal(exampleRes.body.merged);
                      done();
                    });
                });
            });
        });
    });

    it('should create a new example from existing exampleSuggestion in the database', (done) => {
      getExampleSuggestions()
        .then((res) => {
          expect(res.status).to.equal(200);
          const firstExample = res.body[0];
          const mergingExampleSuggestion = { ...firstExample, ...exampleSuggestionData };
          createExample(mergingExampleSuggestion.id)
            .then((result) => {
              expect(result.status).to.equal(200);
              expect(result.body.id).to.not.equal(undefined);
              expect(result.body.authorId).to.equal(undefined);
              getExample(result.body.id)
                .then((updatedExampleRes) => {
                  expect(updatedExampleRes.status).to.equal(200);
                  getExampleSuggestion(firstExample.id)
                    .end((_, exampleRes) => {
                      expect(exampleRes.status).to.equal(200);
                      expect(exampleRes.body.mergedBy).to.equal(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
                      expect(updatedExampleRes.body.igbo).to.equal(exampleRes.body.igbo);
                      expect(updatedExampleRes.body.english).to.equal(exampleRes.body.english);
                      expect(updatedExampleRes.body.id).to.equal(exampleRes.body.merged);
                      done();
                    });
                });
            });
        });
    });

    it('should merge into an existing example', (done) => {
      suggestNewExample(exampleSuggestionData)
        .then((res) => {
          expect(res.status).to.equal(200);
          getExamples()
            .then((examplesRes) => {
              const firstExample = examplesRes.body[0];
              const mergingExampleSuggestion = { ...res.body, originalExampleId: firstExample.id };
              createExample(mergingExampleSuggestion.id)
                .then((result) => {
                  expect(result.status).to.equal(200);
                  expect(result.body.id).to.not.equal(undefined);
                  getExample(result.body.id)
                    .then((updatedExampleRes) => {
                      expect(updatedExampleRes.status).to.equal(200);
                      getExampleSuggestion(res.body.id)
                        .end((_, exampleRes) => {
                          expect(exampleRes.status).to.equal(200);
                          expect(exampleRes.body.mergedBy).to.equal(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
                          expect(updatedExampleRes.body.igbo).to.equal(exampleRes.body.igbo);
                          expect(updatedExampleRes.body.english).to.equal(exampleRes.body.english);
                          expect(updatedExampleRes.body.id).to.equal(exampleRes.body.merged);
                          done();
                        });
                    });
                });
            });
        });
    });

    it('should merge into new example despite provided malformed data', (done) => {
      suggestNewExample(exampleSuggestionData)
        .then((res) => {
          const malformedMergingExampleSuggestion = { ...res.body, ...malformedExampleSuggestionData };
          createExample(malformedMergingExampleSuggestion.id)
            .end((_, result) => {
              expect(result.status).to.equal(200);
              expect(result.body.error).to.equal(undefined);
              done();
            });
        });
    });

    it('should return newly created example by searching with keyword', (done) => {
      suggestNewExample(exampleSuggestionData)
        .then((res) => {
          const mergingExampleSuggestion = { ...res.body, ...exampleSuggestionData };
          createExample(mergingExampleSuggestion.id)
            .then((result) => {
              expect(result.status).to.equal(200);
              expect(result.body.id).to.not.equal(undefined);
              getExamples({ keyword: exampleData.igbo })
                .end((_, exampleRes) => {
                  expect(exampleRes.status).to.equal(200);
                  expect(some(exampleRes.body, (example) => example.igbo === exampleData.igbo)).to.equal(true);
                  done();
                });
            });
        });
    });
  });

  describe('/PUT mongodb examples', () => {
    it('should create a new example and update it', (done) => {
      suggestNewExample(exampleSuggestionData)
        .then((res) => {
          const mergingExampleSuggestion = { ...res.body, ...exampleSuggestionData };
          createExample(mergingExampleSuggestion.id)
            .then((result) => {
              expect(result.status).to.equal(200);
              expect(result.body.id).to.not.equal(undefined);
              updateExample({ id: result.body.id, ...updatedExampleData })
                .end((_, exampleRes) => {
                  expect(exampleRes.status).to.equal(200);
                  expect(new Date(result.body.updatedOn))
                    .to.be.lessThan(new Date(exampleRes.body.updatedOn));
                  forIn(updatedExampleData, (value, key) => {
                    expect(isEqual(exampleRes.body[key], value)).to.equal(true);
                  });
                  done();
                });
            });
        });
    });
  });
});
