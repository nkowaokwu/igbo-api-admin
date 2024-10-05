import handleReviewingResources from 'src/backend/controllers/exampleSuggestions/helpers/handleReviewingResources';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import { translationFixture } from 'src/__tests__/shared/fixtures';

describe('handleReviewingResources', () => {
  it('updates the incoming review for resource - approve', () => {
    const translation = translationFixture({ _id: 'id', text: 'text', denials: ['uid'] });
    handleReviewingResources({
      uid: 'uid',
      resource: translation,
      review: ReviewActions.APPROVE,
      documentId: 'documentId',
    });

    expect(translation.approvals).toContain('uid');
    expect(translation.denials).not.toContain('uid');
  });

  it('updates the incoming review for resource - deny', () => {
    const translation = translationFixture({ _id: 'id', text: 'text', approvals: ['uid'] });
    handleReviewingResources({
      uid: 'uid',
      resource: translation,
      review: ReviewActions.DENY,
      documentId: 'documentId',
    });

    expect(translation.denials).toContain('uid');
    expect(translation.approvals).not.toContain('uid');
  });

  it('updates the incoming review for resource - skip', () => {
    const translation = translationFixture({ _id: 'id', text: 'text', approvals: ['uid'] });
    handleReviewingResources({
      uid: 'uid',
      resource: translation,
      review: ReviewActions.SKIP,
      documentId: 'documentId',
    });

    expect(translation.approvals).toContain('uid');
    expect(translation.denials).not.toContain('uid');
  });
});
