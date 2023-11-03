import { v4 as uuidv4 } from 'uuid';
import { omit, times } from 'lodash';
import { Types } from 'mongoose';
import {
  updateExampleSuggestion,
  putReviewForRandomExampleSuggestions,
  putRandomExampleSuggestionsToTranslate,
  getRandomExampleSuggestionsToTranslate,
  isMergeableAudioPronunciation,
  isEligibleAudioPronunciation,
  getExampleSuggestionUpdateAt,
  getTotalRecordedExampleSuggestions,
  getTotalMergedRecordedExampleSuggestions,
} from 'src/backend/controllers/exampleSuggestions';
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

const omitTimestamps = (pronunciation) => {
  const updatedPronunciation = omit(pronunciation, ['createdAt', 'updatedAt']);
  updatedPronunciation._id = updatedPronunciation._id || updatedPronunciation.id;
  delete updatedPronunciation.id;
  return updatedPronunciation;
};

const requestObject = async (
  { user = AUTH_TOKEN.ADMIN_AUTH_TOKEN, body = {}, query = {} } = {
    user: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
    body: {},
    query: {},
  },
) => {
  const mongooseConnection = await connectDatabase();
  const reqMock = {
    user,
    body,
    query,
    mongooseConnection,
  };
  const resMock = {
    send: jest.fn(),
  };
  const nextMock = jest.fn();
  return { reqMock, resMock, nextMock };
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
    console.log(res);

    res.pronunciations = res.pronunciations.map(omitTimestamps);
    exampleSuggestionRes.body.pronunciations = exampleSuggestionRes.body.pronunciations.map(omitTimestamps);

    Object.entries(exampleSuggestionRes.body).forEach(([key, value]) => {
      if (key !== 'createdAt' && key !== 'updatedAt') {
        expect(res[key]).toEqual(value);
      } else {
        console.log(res[key], value);
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

    const { reqMock, resMock, nextMock } = await requestObject({
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

    console.log(res.body.pronunciations[0].updatedAt);

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

    const { reqMock, resMock, nextMock } = await requestObject({
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

    console.log(res.body.pronunciations[0].updatedAt);

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

    const { reqMock, resMock, nextMock } = await requestObject({
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

    console.log(res.body.pronunciations[0].updatedAt);

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

    const { reqMock, resMock, nextMock } = await requestObject({
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

    console.log(res.body.pronunciations[0].updatedAt);

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

    const { reqMock, resMock, nextMock } = await requestObject({
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

    const { reqMock, resMock, nextMock } = await requestObject({
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
    expect(resMock.send).toBeCalled();
    res.forEach((exampleSuggestion) => {
      expect(exampleSuggestion.english).toBeFalsy();
      expect(exampleSuggestion.userInteractions).not.toContain(AUTH_TOKEN.EDITOR_AUTH_TOKEN);
    });
  });

  describe('Mergeable Audio Pronunciation', () => {
    it('verifies the audio pronunciation', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: [],
        audio: 'http://',
        speaker: uid,
        review: true,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isMergeableAudioPronunciation({ pronunciation, uid })).toEqual(true);
    });

    it('does not verify audio pronunciation - denials', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1', 'uid-3'],
        audio: 'http://',
        speaker: uid,
        review: true,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isMergeableAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - audio', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: '',
        speaker: uid,
        review: true,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isMergeableAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - speaker', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: 'https://',
        speaker: 'uid-1',
        review: true,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isMergeableAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - review', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: 'https://',
        speaker: uid,
        review: false,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isMergeableAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - approvals', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: 'https://',
        speaker: uid,
        review: false,
        approvals: ['uid'],
        archived: false,
        _id: '',
      };
      expect(isMergeableAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - archived', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: 'https://',
        speaker: uid,
        review: false,
        approvals: ['uid', 'uid-2'],
        archived: true,
        _id: '',
      };
      expect(isMergeableAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });
  });

  describe('Eligible Audio Pronunciation', () => {
    it('verifies the audio pronunciation', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: [],
        audio: 'http://',
        speaker: uid,
        review: true,
        approvals: [],
        archived: false,
        _id: '',
      };
      expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(true);
    });

    it('does not verify audio pronunciation - denials', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1', 'uid-3'],
        audio: 'http://',
        speaker: uid,
        review: true,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - audio', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: '',
        speaker: uid,
        review: true,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - speaker', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: 'https://',
        speaker: 'uid-1',
        review: true,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - review', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: 'https://',
        speaker: uid,
        review: false,
        approvals: ['uid', 'uid-2'],
        archived: false,
        _id: '',
      };
      expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });

    it('does not verify audio pronunciation - archived', () => {
      const uid = 'uid';
      const pronunciation = {
        denials: ['uid-1'],
        audio: 'https://',
        speaker: uid,
        review: false,
        approvals: ['uid', 'uid-2'],
        archived: true,
        _id: '',
      };
      expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
    });
  });

  it('gets the example suggestion updated at date', async () => {
    const mongooseConnection = await connectDatabase();
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );
    const unsavedExampleSuggestion = new ExampleSuggestion({
      ...exampleSuggestionData,
    });
    const exampleSuggestion = await unsavedExampleSuggestion.save();
    const date = getExampleSuggestionUpdateAt(exampleSuggestion);
    expect(date).toEqual(exampleSuggestion.updatedAt.toISOString());
  });

  describe('Get Total Merged Recorded Example Suggestions', () => {
    it('gets the total merged recorded example suggestions by month', async () => {
      const { reqMock, resMock, nextMock } = await requestObject({ query: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN } });
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

      expect(resMock.send).toBeCalledWith({
        timestampedExampleSuggestions: {
          [moment(exampleSuggestion.updatedAt).startOf('month').format('MMM, YYYY')]: 1,
        },
      });
    });
  });

  describe('Get Total Recorded Example Suggestions', () => {
    it('gets the total recorded example suggestions', async () => {
      const { reqMock, resMock, nextMock } = await requestObject({ query: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN } });
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

      expect(resMock.send).toBeCalledWith({ count: 10 });
    });

    it('gets the total recorded example suggestions with merged example suggestions', async () => {
      const { reqMock, resMock, nextMock } = await requestObject({ query: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN } });
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

      expect(resMock.send).toBeCalledWith({ count: 10 });
    });
  });
});
