import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';

describe('validateBulkUploadExampleSuggestionBody', () => {
  it('passes validation for the provided bulk sentence data', async () => {
    const body = [
      {
        igbo: 'testing',
        english: 'testing',
        style: ExampleStyleEnum.NO_STYLE,
        source: SuggestionSourceEnum.IGBO_SPEECH,
        type: SentenceTypeEnum.DATA_COLLECTION,
      },
      {
        igbo: 'testing',
        english: 'testing',
        style: ExampleStyleEnum.NO_STYLE,
        source: SuggestionSourceEnum.IGBO_SPEECH,
        type: SentenceTypeEnum.DATA_COLLECTION,
      },
      {
        igbo: 'testing',
        english: 'testing',
        style: ExampleStyleEnum.NO_STYLE,
        source: SuggestionSourceEnum.IGBO_SPEECH,
        type: SentenceTypeEnum.DATA_COLLECTION,
      },
    ];

    const mockReq = { body };
    const mockRes = { send: jest.fn() };
    const mockNext = jest.fn();

    await validateBulkUploadExampleSuggestionBody(mockReq, mockRes, mockNext);
    expect(mockNext).toBeCalled();
    expect(mockRes.send).not.toBeCalled();
  });

  it('fails validation for the provided bulk sentence data', async () => {
    const body = [
      {
        igbo: 'testing',
        english: 'testing',
        style: ExampleStyleEnum.NO_STYLE,
        source: 'rubbish',
        type: SentenceTypeEnum.DATA_COLLECTION,
      },
      {
        igbo: 'testing',
        english: 'testing',
        style: ExampleStyleEnum.NO_STYLE,
        source: SuggestionSourceEnum.IGBO_SPEECH,
        type: SentenceTypeEnum.DATA_COLLECTION,
      },
      {
        igbo: 'testing',
        english: 'testing',
        style: ExampleStyleEnum.NO_STYLE,
        source: SuggestionSourceEnum.IGBO_SPEECH,
        type: SentenceTypeEnum.DATA_COLLECTION,
      },
    ];

    const mockReq = { body };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    await validateBulkUploadExampleSuggestionBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toBeCalled();
    expect(mockNext).not.toBeCalled();
  });
});
