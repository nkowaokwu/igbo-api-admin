import validateNsibidiCharacterBody from 'src/backend/middleware/validateNsibidiCharacterBody';
import WordClass from 'src/backend/shared/constants/WordClass';

describe('validateNsibidiCharacterBody', () => {
  it('passes validation the provided nsibidi character body', async () => {
    const body = {
      nsibidi: 'nsibidi',
      definitions: [{ text: 'text' }],
      radicals: [{ id: 'radical-id' }],
      pronunciation: 'pronunciation',
      wordClass: WordClass.ADJ.nsibidiValue,
    };
    const mockReq = { body };
    const mockRes = { send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateNsibidiCharacterBody(mockReq, mockRes, mockNext);
    expect(mockNext).toBeCalled();
    expect(mockRes.send).not.toBeCalled();
  });

  it('fails validation the provided nsibidi character body', async () => {
    const body = {
      nsibidi: 'nsibidi',
      definitions: [{ textd: 'text' }],
      radicals: ['radical-id'],
      pronunciation: 'pronunciation',
      wordClass: WordClass.ADJ.nsibidiValue,
    };
    const mockReq = { body };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateNsibidiCharacterBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toBeCalled();
    expect(mockRes.status).toBeCalledWith(400);
    expect(mockNext).not.toBeCalled();
  });
});
