import validateNsibidiCharacterBody from 'src/backend/middleware/validateNsibidiCharacterBody';
import WordClass from 'src/backend/shared/constants/WordClass';

describe('validateNsibidiCharacterBody', () => {
  it('passes validation the provided nsibidi character body', async () => {
    const body = {
      nsibidi: 'nsibidi',
      radicals: [{ id: 'radical-id' }],
    };
    const mockReq = { body };
    const mockRes = { send: jest.fn() };
    const mockNext = jest.fn();

    // @ts-expect-error
    await validateNsibidiCharacterBody(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
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
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
