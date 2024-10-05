import validateRandomExampleSuggestionTranslationBody from 'src/backend/middleware/validateRandomExampleSuggestionTranslationBody';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { exampleSuggestionTranslationFixture } from 'src/__tests__/shared/fixtures';

describe('validateRandomExampleSuggestionTranslationBody', () => {
  it('passes validation the provided example suggestion translation', async () => {
    const exampleSuggestionTranslation = exampleSuggestionTranslationFixture({
      id: 'id',
      translations: [
        {
          text: 'translation',
          language: LanguageEnum.IGBO,
          pronunciations: [],
        },
      ],
    });
    const mockReq = { body: [exampleSuggestionTranslation] };
    const mockRes = { send: jest.fn(), status: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });

  it('passes validation the provided example suggestion translation with audio recording', async () => {
    const exampleSuggestionTranslation = exampleSuggestionTranslationFixture({
      id: 'id',
      translations: [
        {
          text: 'translation',
          language: LanguageEnum.IGBO,
          pronunciations: [
            {
              audio: 'this is an audio',
            },
          ],
        },
      ],
    });
    const mockReq = { body: [exampleSuggestionTranslation] };
    const mockRes = { send: jest.fn(), status: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });

  it('fails validation the provided example suggestion translation - id', async () => {
    const exampleSuggestionTranslation = exampleSuggestionTranslationFixture({
      id: '',
      translations: [
        {
          text: 'translation',
          language: LanguageEnum.IGBO,
          pronunciations: [
            {
              audio: 'this is an audio',
            },
          ],
        },
      ],
    });
    const mockReq = { body: [exampleSuggestionTranslation] };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('fails validation the provided example suggestion translation - translations', async () => {
    const exampleSuggestionTranslation = exampleSuggestionTranslationFixture({
      id: 'id',
      translations: undefined,
    });
    const mockReq = { body: [exampleSuggestionTranslation] };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('fails validation the provided example suggestion translation - translation text', async () => {
    const exampleSuggestionTranslation = exampleSuggestionTranslationFixture({
      id: 'id',
      translations: [
        {
          text: '',
          language: LanguageEnum.IGBO,
          pronunciations: [
            {
              audio: 'this is an audio',
            },
          ],
        },
      ],
    });
    const mockReq = { body: [exampleSuggestionTranslation] };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('fails validation the provided example suggestion translation - translation language', async () => {
    const exampleSuggestionTranslation = exampleSuggestionTranslationFixture({
      id: 'id',
      translations: [
        {
          text: 'text',
          // @ts-expect-error
          language: 'anything',
          pronunciations: [
            {
              audio: 'this is an audio',
            },
          ],
        },
      ],
    });
    const mockReq = { body: [exampleSuggestionTranslation] };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('fails validation the provided example suggestion translation - translation pronunciations', async () => {
    const exampleSuggestionTranslation = exampleSuggestionTranslationFixture({
      id: 'id',
      translations: [
        {
          text: 'text',
          language: LanguageEnum.IGBO,
          // @ts-expect-error
          pronunciations: ['this is an audio'],
        },
      ],
    });
    const mockReq = { body: [exampleSuggestionTranslation] };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  // eslint-disable-next-line max-len
  it('fails validation the provided example suggestion translation - translation pronunciations extra field', async () => {
    const exampleSuggestionTranslation = exampleSuggestionTranslationFixture({
      id: 'id',
      translations: [
        {
          text: 'text',
          language: LanguageEnum.IGBO,
          pronunciations: [
            {
              audio: 'this is an audio',
              // @ts-expect-error
              extra: true,
            },
          ],
        },
      ],
    });
    const mockReq = { body: [exampleSuggestionTranslation] };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
