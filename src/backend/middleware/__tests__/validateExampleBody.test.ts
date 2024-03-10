import validateExampleBody from 'src/backend/middleware/validateExampleBody';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';

describe('validateExampleBody', () => {
  it('passes validation the provided example sentence body', async () => {
    const body = {
      igbo: 'igbo',
      english: 'english',
      meaning: 'meaning',
      nsibidi: 'nsibidi',
      type: SentenceTypeEnum.BIBLICAL,
      style: ExampleStyleEnum.NO_STYLE,
      pronunciations: [
        { audio: 'first', speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN, archived: false },
        { audio: 'first', speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN, archived: true },
      ],
    };
    const mockReq = { body };
    const mockRes = { send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateExampleBody(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });

  it('fails validation the provided example sentence body', async () => {
    const body = {
      igbo: 'igbo',
      english: 'english',
      meaning: 'meaning',
      nsibidi: 'nsibidi',
      type: SentenceTypeEnum.BIBLICAL,
      style: ExampleStyleEnum.NO_STYLE,
      pronunciations: [
        { audio: 'first', speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN, archived: false },
        { audio: 'first', speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN, archived: true },
      ],
      archived: false,
      fake: true,
    };
    const mockReq = { body };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateExampleBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
