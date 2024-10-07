import validateRandomExampleSuggestionTranslationReviews from 'src/backend/middleware/validateRandomExampleSuggestionTranslationReviews';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import { exampleSuggestionTranslationReviewFixture } from 'src/__tests__/shared/fixtures';
import { nextFixture, requestFixture, responseFixture } from 'src/__tests__/shared/fixtures/requestFixtures';

describe('validateRandomExampleSuggestionTranslationReview', () => {
  it('validates the incoming random example suggestion translation reviews', async () => {
    const translationReview = exampleSuggestionTranslationReviewFixture({
      id: 'test',
      translations: [
        {
          id: 'translation-id',
          review: ReviewActions.APPROVE,
        },
      ],
    });
    const req = requestFixture({ data: [translationReview] });
    const res = responseFixture();
    const next = nextFixture();

    await validateRandomExampleSuggestionTranslationReviews(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('fails validation for malformed translation body - id', async () => {
    const translationReview = exampleSuggestionTranslationReviewFixture({ id: '', translations: [] });
    const req = requestFixture({ data: [translationReview] });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateRandomExampleSuggestionTranslationReviews(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed translation body - translation id', async () => {
    const translationReview = exampleSuggestionTranslationReviewFixture({
      id: 'id',
      translations: [{ id: '', review: ReviewActions.APPROVE }],
    });
    const req = requestFixture({ data: [translationReview] });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateRandomExampleSuggestionTranslationReviews(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed translation body - translation review', async () => {
    const translationReview = exampleSuggestionTranslationReviewFixture({
      id: 'id',
      translations: [{ id: 'translation-id', review: undefined }],
    });
    const req = requestFixture({ data: [translationReview] });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateRandomExampleSuggestionTranslationReviews(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed translation body - extra field', async () => {
    const translationReview = exampleSuggestionTranslationReviewFixture({
      id: 'id',
      // @ts-expect-error
      translations: [{ id: 'translation-id', review: ReviewActions.APPROVE, extra: true }],
    });
    const req = requestFixture({ data: [translationReview] });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateRandomExampleSuggestionTranslationReviews(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
