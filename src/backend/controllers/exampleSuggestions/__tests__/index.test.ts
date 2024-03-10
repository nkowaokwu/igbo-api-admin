import { v4 as uuidv4 } from 'uuid';
import { omit, times } from 'lodash';
import { Types } from 'mongoose';
import {
  putReviewForRandomExampleSuggestions,
  putRandomExampleSuggestionsToTranslate,
  getRandomExampleSuggestionsToTranslate,
  getTotalRecordedExampleSuggestions,
  getTotalMergedRecordedExampleSuggestions,
  getRandomExampleSuggestionsToReview,
  postBulkUploadExampleSuggestions,
} from 'src/backend/controllers/exampleSuggestions';
import updateExampleSuggestion from 'src/backend/controllers/exampleSuggestions/helpers/updateExampleSuggestion';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import { connectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { getExampleSuggestion, suggestNewExample } from 'src/__tests__/shared/commands';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import moment from 'moment';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import createRequestObject from 'src/__tests__/shared/createRequestObject';
import { getRandomExampleSuggestionsToRecord } from '..';

const omitTimestamps = (pronunciation) => {
  const updatedPronunciation = omit(pronunciation, ['createdAt', 'updatedAt']);
  updatedPronunciation._id = updatedPronunciation._id || updatedPronunciation.id;
  delete updatedPronunciation.id;
  return updatedPronunciation;
};

// NOTE: It's expected for the updatedAt and createdAt fields within
// each pronunciation to change. We rely on the review field within
// Example Suggestions to calculate a user's contributions.

describe('exampleSuggestions controller', () => {
  beforeEach(async () => {
    await dropMongoDBCollections();
  });
  // Passing locally, failing in GitHub
  it.skip('updates an example suggestion', async () => {
    const mongooseConnection = await connectDatabase();

    const exampleSuggestionRes = await suggestNewExample({
      ...exampleSuggestionData,
      pronunciations: [
        {
          audio: 'first audio',
          speaker: 'first speaker',
        },
        { audio: 'second audio', speaker: 'second speaker' },
      ],
    });
    expect(exampleSuggestionRes.status).toEqual(200);

    const res = (
      await updateExampleSuggestion({
        id: exampleSuggestionRes.body.id,
        data: exampleSuggestionRes.body,
        mongooseConnection,
      })
    ).toObject();
    // console.log(res);

    res.pronunciations = res.pronunciations.map(omitTimestamps);
    exampleSuggestionRes.body.pronunciations = exampleSuggestionRes.body.pronunciations.map(omitTimestamps);

    Object.entries(exampleSuggestionRes.body).forEach(([key, value]) => {
      if (key !== 'createdAt' && key !== 'updatedAt') {
        expect(res[key]).toEqual(value);
      } else {
        // console.log(res[key], value);
      }
    });
  });

  it('approve example suggestion and update first pronunciation updatedAt', async () => {
    const exampleSuggestionRes = await suggestNewExample({
      ...exampleSuggestionData,
      pronunciations: [
        {
          audio: 'first audio',
          speaker: 'first speaker',
        },
        { audio: 'second audio', speaker: 'second speaker' },
      ],
    });
    expect(exampleSuggestionRes.status).toEqual(200);

    const { createdAt, updatedAt } = exampleSuggestionRes.body.pronunciations[0];

    const { reqMock, resMock, nextMock } = await createRequestObject({
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.APPROVE,
          },
        },
      ],
    });
    await putReviewForRandomExampleSuggestions(reqMock, resMock, nextMock);

    const res = await getExampleSuggestion(exampleSuggestionRes.body.id);
    expect(res.status).toEqual(200);

    // console.log(res.body.pronunciations[0].updatedAt);

    expect(res.body.pronunciations[0].createdAt).toEqual(createdAt);
    expect(res.body.pronunciations[0].updatedAt).not.toEqual(updatedAt);
  });

  it('deny example suggestion and update first pronunciation updatedAt', async () => {
    const exampleSuggestionRes = await suggestNewExample({
      ...exampleSuggestionData,
      pronunciations: [
        {
          audio: 'first audio',
          speaker: 'first speaker',
        },
        { audio: 'second audio', speaker: 'second speaker' },
      ],
    });
    expect(exampleSuggestionRes.status).toEqual(200);

    const { createdAt, updatedAt } = exampleSuggestionRes.body.pronunciations[0];

    const { reqMock, resMock, nextMock } = await createRequestObject({
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.DENY,
          },
        },
      ],
    });
    await putReviewForRandomExampleSuggestions(reqMock, resMock, nextMock);

    const res = await getExampleSuggestion(exampleSuggestionRes.body.id);
    expect(res.status).toEqual(200);

    // console.log(res.body.pronunciations[0].updatedAt);

    expect(res.body.pronunciations[0].createdAt).toEqual(createdAt);
    expect(res.body.pronunciations[0].updatedAt).not.toEqual(updatedAt);
  });

  it('skip example suggestion and update first pronunciation updatedAt', async () => {
    const exampleSuggestionRes = await suggestNewExample({
      ...exampleSuggestionData,
      pronunciations: [
        {
          audio: 'first audio',
          speaker: 'first speaker',
        },
        { audio: 'second audio', speaker: 'second speaker' },
      ],
    });
    expect(exampleSuggestionRes.status).toEqual(200);

    const { createdAt, updatedAt } = exampleSuggestionRes.body.pronunciations[0];

    const { reqMock, resMock, nextMock } = await createRequestObject({
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.SKIP,
          },
        },
      ],
    });
    await putReviewForRandomExampleSuggestions(reqMock, resMock, nextMock);

    const res = await getExampleSuggestion(exampleSuggestionRes.body.id);
    expect(res.status).toEqual(200);

    // console.log(res.body.pronunciations[0].updatedAt);

    expect(res.body.pronunciations[0].createdAt).toEqual(createdAt);
    expect(res.body.pronunciations[0].updatedAt).toEqual(updatedAt);
  });

  it('approve example suggestion without updating first pronunciation updatedAt', async () => {
    const exampleSuggestionRes = await suggestNewExample({
      ...exampleSuggestionData,
      pronunciations: [
        {
          audio: 'first audio',
          speaker: 'first speaker',
        },
        { audio: 'second audio', speaker: 'second speaker' },
      ],
    });
    expect(exampleSuggestionRes.status).toEqual(200);

    const { createdAt, updatedAt } = exampleSuggestionRes.body.pronunciations[0];

    const { reqMock, resMock, nextMock } = await createRequestObject({
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[1]._id]: ReviewActions.APPROVE,
          },
        },
      ],
    });
    await putReviewForRandomExampleSuggestions(reqMock, resMock, nextMock);

    const res = await getExampleSuggestion(exampleSuggestionRes.body.id);
    expect(res.status).toEqual(200);

    // console.log(res.body.pronunciations[0].updatedAt);

    expect(res.body.pronunciations[0].createdAt).toEqual(createdAt);
    expect(res.body.pronunciations[0].updatedAt).toEqual(updatedAt);
  });

  it('deny example suggestion without updating first pronunciation updatedAt', async () => {
    const exampleSuggestionRes = await suggestNewExample({
      ...exampleSuggestionData,
      pronunciations: [
        {
          audio: 'first audio',
          speaker: 'first speaker',
        },
        { audio: 'second audio', speaker: 'second speaker' },
      ],
    });
    expect(exampleSuggestionRes.status).toEqual(200);

    const { createdAt, updatedAt } = exampleSuggestionRes.body.pronunciations[0];

    const { reqMock, resMock, nextMock } = await createRequestObject({
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[1]._id]: ReviewActions.DENY,
          },
        },
      ],
    });
    await putReviewForRandomExampleSuggestions(reqMock, resMock, nextMock);

    const res = await getExampleSuggestion(exampleSuggestionRes.body.id);
    expect(res.status).toEqual(200);

    expect(res.body.pronunciations[0].createdAt).toEqual(createdAt);
    expect(res.body.pronunciations[0].updatedAt).toEqual(updatedAt);
  });

  it('updates an example suggestion english translation', async () => {
    const exampleSuggestionRes = await suggestNewExample({
      ...exampleSuggestionData,
      igbo: uuidv4(),
      pronunciations: [
        {
          audio: 'first audio',
          speaker: 'first speaker',
        },
        { audio: 'second audio', speaker: 'second speaker' },
      ],
    });
    expect(exampleSuggestionRes.status).toEqual(200);

    const { reqMock, resMock, nextMock } = await createRequestObject({
      body: [
        {
          id: exampleSuggestionRes.body.id,
          english: 'updated english',
        },
      ],
    });
    await putRandomExampleSuggestionsToTranslate(reqMock, resMock, nextMock);
    expect(reqMock.response[0].crowdsourcing[CrowdsourcingType.TRANSLATE_IGBO_SENTENCE]).toEqual(true);

    const res = await getExampleSuggestion(exampleSuggestionRes.body.id);

    expect(res.status).toEqual(200);
    expect(res.body.english).toEqual('updated english');
    expect(res.body.userInteractions).toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    expect(res.body.crowdsourcing[CrowdsourcingType.TRANSLATE_IGBO_SENTENCE]).toEqual(true);
    Object.values(CrowdsourcingType).forEach((crowdsourcingType) => {
      if (crowdsourcingType !== CrowdsourcingType.TRANSLATE_IGBO_SENTENCE) {
        expect(res.body.crowdsourcing[crowdsourcingType]).toEqual(false);
      }
    });
  });

  it('five random sentences to translate get returned', async () => {
    await Promise.all(
      times(5, async () =>
        suggestNewExample({
          ...exampleSuggestionData,
          english: '',
          pronunciations: [
            {
              audio: 'first audio',
              speaker: 'first speaker',
            },
            { audio: 'second audio', speaker: 'second speaker' },
          ],
        }),
      ),
    );

    const mongooseConnection = await connectDatabase();
    const reqMock = {
      user: { uid: AUTH_TOKEN.EDITOR_AUTH_TOKEN },
      query: {
        page: 0,
        range: '[0,4]',
      },
      mongooseConnection,
    };
    let res;
    const resMock = {
      send: jest.fn((data) => {
        res = data;
      }),
      setHeader: jest.fn(),
    };
    const nextMock = jest.fn();
    await getRandomExampleSuggestionsToTranslate(reqMock, resMock, nextMock);
    expect(resMock.send).toHaveBeenCalled();
    res.forEach((exampleSuggestion) => {
      expect(exampleSuggestion.english).toBeFalsy();
      expect(exampleSuggestion.userInteractions).not.toContain(AUTH_TOKEN.EDITOR_AUTH_TOKEN);
    });
  });

  describe('Get Total Merged Recorded Example Suggestions', () => {
    it('gets the total merged recorded example suggestions by month', async () => {
      const { reqMock, resMock, nextMock } = await createRequestObject({ query: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN } });
      const mongooseConnection = await connectDatabase();
      const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );
      const unsavedExampleSuggestion = new ExampleSuggestion({
        ...exampleSuggestionData,
        pronunciations: [
          {
            denials: [],
            approvals: [AUTH_TOKEN.ADMIN_AUTH_TOKEN, AUTH_TOKEN.EDITOR_AUTH_TOKEN],
            audio: 'https://',
            speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
            review: true,
          },
        ],
        type: SentenceTypeEnum.DATA_COLLECTION,
        merged: new Types.ObjectId(),
        mergedBy: AUTH_TOKEN.MERGER_AUTH_TOKEN,
      });

      const exampleSuggestion = await unsavedExampleSuggestion.save();
      await getTotalMergedRecordedExampleSuggestions(reqMock, resMock, nextMock);

      expect(resMock.send).toHaveBeenCalledWith({
        timestampedExampleSuggestions: {
          [moment(exampleSuggestion.updatedAt).startOf('month').format('MMM, YYYY')]: 1,
        },
      });
    });
  });

  describe('Get Total Recorded Example Suggestions', () => {
    it('gets the total recorded example suggestions', async () => {
      const { reqMock, resMock, nextMock } = await createRequestObject({ query: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN } });
      const mongooseConnection = await connectDatabase();
      const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );
      await Promise.all(
        times(10, async () => {
          const unsavedExampleSuggestion = new ExampleSuggestion({
            ...exampleSuggestionData,
            pronunciations: [
              {
                denials: [],
                approvals: [AUTH_TOKEN.ADMIN_AUTH_TOKEN, AUTH_TOKEN.EDITOR_AUTH_TOKEN],
                audio: 'https://',
                speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
                review: true,
              },
            ],
            type: SentenceTypeEnum.DATA_COLLECTION,
          });

          await unsavedExampleSuggestion.save();
        }),
      );
      await getTotalRecordedExampleSuggestions(reqMock, resMock, nextMock);

      expect(resMock.send).toHaveBeenCalledWith({
        timestampedRecordedExampleSuggestions: { [moment().format('MMM, YYYY')]: 10 },
      });
    });

    it('gets the total recorded example suggestions with merged example suggestions', async () => {
      const { reqMock, resMock, nextMock } = await createRequestObject({ query: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN } });
      const mongooseConnection = await connectDatabase();
      const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );
      await Promise.all(
        times(10, async () => {
          const unsavedExampleSuggestion = new ExampleSuggestion({
            ...exampleSuggestionData,
            pronunciations: [
              {
                denials: [],
                approvals: [AUTH_TOKEN.ADMIN_AUTH_TOKEN, AUTH_TOKEN.EDITOR_AUTH_TOKEN],
                audio: 'https://',
                speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
                review: true,
              },
            ],
            type: SentenceTypeEnum.DATA_COLLECTION,
            merged: new Types.ObjectId(),
            mergedBy: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
          });

          await unsavedExampleSuggestion.save();
        }),
      );
      await getTotalRecordedExampleSuggestions(reqMock, resMock, nextMock);

      expect(resMock.send).toHaveBeenCalledWith({
        timestampedRecordedExampleSuggestions: { [moment().format('MMM, YYYY')]: 10 },
      });
    });

    it('returns example suggestions not already recorded by current user', async () => {
      const { reqMock, resMock, nextMock } = await createRequestObject({
        user: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
      });
      const mongooseConnection = await connectDatabase();
      const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );

      const unsavedExampleSuggestion = new ExampleSuggestion({
        ...exampleSuggestionData,
        pronunciations: [
          {
            denials: [],
            approvals: [AUTH_TOKEN.MERGER_AUTH_TOKEN, AUTH_TOKEN.EDITOR_AUTH_TOKEN],
            audio: 'https://',
            speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN,
            review: true,
          },
          {
            denials: [],
            approvals: [AUTH_TOKEN.ADMIN_AUTH_TOKEN],
            audio: 'https://',
            speaker: AUTH_TOKEN.EDITOR_AUTH_TOKEN,
            review: true,
          },
        ],
        type: SentenceTypeEnum.DATA_COLLECTION,
      });

      await unsavedExampleSuggestion.save();

      await getRandomExampleSuggestionsToRecord(reqMock, resMock, nextMock);
      expect(resMock.send).not.toHaveBeenCalledWith([]);
    });

    it('does not return example suggestions already recorded by current user', async () => {
      const { reqMock, resMock, nextMock } = await createRequestObject({
        user: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
      });
      const mongooseConnection = await connectDatabase();
      const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );

      const unsavedExampleSuggestion = new ExampleSuggestion({
        ...exampleSuggestionData,
        pronunciations: [
          {
            denials: [],
            approvals: [AUTH_TOKEN.MERGER_AUTH_TOKEN, AUTH_TOKEN.EDITOR_AUTH_TOKEN],
            audio: 'https://',
            speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN,
            review: true,
          },
          {
            denials: [],
            approvals: [AUTH_TOKEN.ADMIN_AUTH_TOKEN],
            audio: 'https://',
            speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
            review: true,
          },
        ],
        type: SentenceTypeEnum.DATA_COLLECTION,
      });

      await unsavedExampleSuggestion.save();

      await getRandomExampleSuggestionsToRecord(reqMock, resMock, nextMock);
      expect(resMock.send).toHaveBeenCalledWith([]);
    });

    it('returns example suggestions not recorded by current user when reviewing', async () => {
      const { reqMock, resMock, nextMock } = await createRequestObject();
      const mongooseConnection = await connectDatabase();
      const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );

      const unsavedExampleSuggestion = new ExampleSuggestion({
        ...exampleSuggestionData,
        pronunciations: [
          {
            denials: [],
            approvals: [AUTH_TOKEN.MERGER_AUTH_TOKEN],
            audio: 'https://',
            speaker: AUTH_TOKEN.MERGER_AUTH_TOKEN,
            review: true,
          },
        ],
        type: SentenceTypeEnum.DATA_COLLECTION,
      });

      await unsavedExampleSuggestion.save();

      await getRandomExampleSuggestionsToReview(reqMock, resMock, nextMock);
      expect(resMock.send).not.toHaveBeenCalledWith([]);
    });

    it('does not return example suggestions recorded by current user when reviewing', async () => {
      const { reqMock, resMock, nextMock } = await createRequestObject();
      const mongooseConnection = await connectDatabase();
      const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );

      const unsavedExampleSuggestion = new ExampleSuggestion({
        ...exampleSuggestionData,
        pronunciations: [
          {
            denials: [],
            approvals: [AUTH_TOKEN.MERGER_AUTH_TOKEN],
            audio: 'https://',
            speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
            review: true,
          },
        ],
        type: SentenceTypeEnum.DATA_COLLECTION,
      });

      await unsavedExampleSuggestion.save();

      await getRandomExampleSuggestionsToReview(reqMock, resMock, nextMock);
      expect(resMock.send).toHaveBeenCalledWith([]);
    });
  });

  describe('Bulk Uploading Example Suggestions', () => {
    it('bulk uploads 500 example suggestions', async () => {
      const exampleSentenceData = times(500, (index) => ({
        igbo: `random-sentence-${index}`,
      }));
      const result = times(500, (index) => ({
        message: 'Success',
        meta: {
          sentenceData: `random-sentence-${index}`,
        },
        success: true,
      }));
      const mongooseConnection = await connectDatabase();
      const reqMock = {
        user: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
        body: exampleSentenceData,
        mongooseConnection,
      };

      const resMock = {
        send: jest.fn(),
        setHeader: jest.fn(),
      };
      const nextMock = jest.fn();
      await postBulkUploadExampleSuggestions(reqMock, resMock, nextMock);
      expect(resMock.send.mock.calls[0][0]).toMatchObject(result);
    });
  });
});
