import * as exampleTranscriptionFeedback from 'src/backend/controllers/exampleTranscriptionFeedback';
import { exampleTranscriptionFeedbackFixture } from 'src/__tests__/shared/fixtures';
import {
  mongooseConnectionFixture,
  findOneMock,
  requestFixture,
  responseFixture,
  nextFixture,
} from 'src/__tests__/shared/fixtures/requestFixtures';

describe('exampleTranscriptionFeedback', () => {
  it('findExampleTranscriptionFeedbackByExampleSuggestionId', async () => {
    const exampleTranscriptionFeedbackDoc = exampleTranscriptionFeedbackFixture();
    const suggestionDocument = await exampleTranscriptionFeedback.findExampleTranscriptionFeedbackByExampleSuggestionId(
      'id',
      mongooseConnectionFixture({ findOne: exampleTranscriptionFeedbackDoc }),
    );
    expect(findOneMock).toHaveBeenLastCalledWith(exampleTranscriptionFeedbackDoc);
    expect(suggestionDocument).toEqual(exampleTranscriptionFeedbackDoc);
  });

  it('getExampleTranscriptionFeedback', async () => {
    const exampleTranscriptionFeedbackDoc = exampleTranscriptionFeedbackFixture();

    await exampleTranscriptionFeedback.getExampleTranscriptionFeedback(
      requestFixture({ mongooseConnection: mongooseConnectionFixture({ findOne: exampleTranscriptionFeedbackDoc }) }),
      responseFixture(),
      nextFixture(),
    );
    expect(findOneMock).toHaveBeenLastCalledWith(exampleTranscriptionFeedbackDoc);
  });
});
