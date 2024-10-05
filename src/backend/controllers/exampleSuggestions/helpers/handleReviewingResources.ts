import ReviewActions from 'src/backend/shared/constants/ReviewActions';

const handleReviewingResources = ({
  uid,
  resource,
  review,
  documentId,
}: {
  uid: string;
  resource: { approvals: string[]; denials: string[] };
  review: ReviewActions;
  documentId: string;
}): void => {
  // Handle approving the Example Suggestion audio pronunciations
  if (review === ReviewActions.APPROVE) {
    const approvals = new Set(resource.approvals || []);
    approvals.add(uid);
    resource.approvals = Array.from(approvals);
    resource.denials = (resource.denials || []).filter((denial) => denial !== uid);
  }
  // Handle denying the Example Suggestion audio pronunciations
  if (review === ReviewActions.DENY) {
    const denials = new Set(resource.denials || []);
    denials.add(uid);
    resource.denials = Array.from(denials);
    resource.approvals = (resource.approvals || []).filter((approval) => approval !== uid);
  }
  if (review === ReviewActions.SKIP) {
    console.log(`The user ${uid} skipped reviewing suggestion ${documentId}`);
  }
};

export default handleReviewingResources;
