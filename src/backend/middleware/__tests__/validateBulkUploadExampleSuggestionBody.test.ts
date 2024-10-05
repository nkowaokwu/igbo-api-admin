import validateBulkUploadExampleSuggestionBody from 'src/backend/middleware/validateBulkUploadExampleSuggestionBody';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

describe('validateBulkUploadExampleSuggestionBody', () => {
  it('passes validation for the provided bulk sentence data', async () => {
    const body = [
      {
        source: {
          text: 'igbo',
          language: LanguageEnum.IGBO,
        },
      },
      {
        source: {
          text: 'yoruba',
          language: LanguageEnum.YORUBA,
        },
      },
      {
        source: {
          text: 'english',
          language: LanguageEnum.ENGLISH,
        },
      },
    ];

    const mockReq = { body };
    const mockRes = { send: jest.fn() };
    const mockNext = jest.fn();

    await validateBulkUploadExampleSuggestionBody(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });

  it('fails validation for the provided bulk sentence data', async () => {
    const body = [
      {
        source: {
          language: LanguageEnum.IGBO,
        },
      },
      {
        source: {
          yoruba: 'yoruba',
          language: LanguageEnum.YORUBA,
        },
      },
      {
        source: {
          text: 'english',
          language: LanguageEnum.ENGLISH,
        },
      },
    ];
    const mockReq = { body };
    const mockRes = { status: jest.fn(), send: jest.fn() };
    const mockNext = jest.fn();

    await validateBulkUploadExampleSuggestionBody(mockReq, mockRes, mockNext);
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });
});
