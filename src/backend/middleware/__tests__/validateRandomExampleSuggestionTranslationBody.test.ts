import validateRandomExampleSuggestionTranslationBody from 'src/backend/middleware/validateRandomExampleSuggestionTranslationBody';

describe('validateRandomExampleSuggestionTranslationBody', () => {
  it('passes validation the provided example suggestion translation', async () => {
    const body = [
      {
        id: '123',
        english: 'english',
      },
    ];
    const mockReq = { body };
    const mockRes = { send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockNext).toBeCalled();
    expect(mockRes.send).not.toBeCalled();
  });

  it('fails validation the provided example suggestion translation', async () => {
    const body = {
      id: '123',
      english: 'english',
      igbo: 'igbo',
    };
    const mockReq = { body };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateRandomExampleSuggestionTranslationBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toBeCalled();
    expect(mockRes.status).toBeCalledWith(400);
    expect(mockNext).not.toBeCalled();
  });
});
