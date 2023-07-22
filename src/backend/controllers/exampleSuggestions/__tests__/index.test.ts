import { omit, times } from 'lodash';
import {
  updateExampleSuggestion,
  putReviewForRandomExampleSuggestions,
  putRandomExampleSuggestionsToTranslate,
  getRandomExampleSuggestionsToTranslate,
} from 'src/backend/controllers/exampleSuggestions';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import { connectDatabase } from 'src/backend/utils/database';
import { getExampleSuggestion, suggestNewExample } from 'src/__tests__/shared/commands';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';

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

    const mongooseConnection = await connectDatabase();
    const reqMock = {
      user: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.APPROVE,
          },
        },
      ],
      mongooseConnection,
    };
    const resMock = {
      send: jest.fn(),
    };
    const nextMock = jest.fn();
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

    const mongooseConnection = await connectDatabase();
    const reqMock = {
      user: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.DENY,
          },
        },
      ],
      mongooseConnection,
    };
    const resMock = {
      send: jest.fn(),
    };
    const nextMock = jest.fn();
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

    const mongooseConnection = await connectDatabase();
    const reqMock = {
      user: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[0]._id]: ReviewActions.SKIP,
          },
        },
      ],
      mongooseConnection,
    };
    const resMock = {
      send: jest.fn(),
    };
    const nextMock = jest.fn();
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

    const mongooseConnection = await connectDatabase();
    const reqMock = {
      user: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[1]._id]: ReviewActions.APPROVE,
          },
        },
      ],
      mongooseConnection,
    };
    const resMock = {
      send: jest.fn(),
    };
    const nextMock = jest.fn();
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

    const mongooseConnection = await connectDatabase();
    const reqMock = {
      user: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
      body: [
        {
          id: exampleSuggestionRes.body.id,
          reviews: {
            [exampleSuggestionRes.body.pronunciations[1]._id]: ReviewActions.DENY,
          },
        },
      ],
      mongooseConnection,
    };
    const resMock = {
      send: jest.fn(),
    };
    const nextMock = jest.fn();
    await putReviewForRandomExampleSuggestions(reqMock, resMock, nextMock);

    const res = await getExampleSuggestion(exampleSuggestionRes.body.id);
    expect(res.status).toEqual(200);

    expect(res.body.pronunciations[0].createdAt).toEqual(createdAt);
    expect(res.body.pronunciations[0].updatedAt).toEqual(updatedAt);
  });

  it('updates an example suggestion english translation', async () => {
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

    const mongooseConnection = await connectDatabase();
    const reqMock = {
      user: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
      body: [
        {
          id: exampleSuggestionRes.body.id,
          english: 'updated english',
        },
      ],
      mongooseConnection,
    };
    const resMock = {
      send: jest.fn(),
    };
    const nextMock = jest.fn();
    await putRandomExampleSuggestionsToTranslate(reqMock, resMock, nextMock);
    expect(reqMock.response[0].crowdsourcing[CrowdsourcingType.TRANSLATE_IGBO_SENTENCE]).toEqual(true);

    const res = await getExampleSuggestion(exampleSuggestionRes.body.id);

    expect(res.status).toEqual(200);
    expect(res.body.english).toEqual('updated english');
    expect(res.body.userInteractions).toContain(AUTH_TOKEN.ADMIN_AUTH_TOKEN);
    console.log(res.body);
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
});
