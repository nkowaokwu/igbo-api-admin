import Requirements from 'src/backend/shared/constants/Requirements';

export default (req, res, next) => {
  const { suggestionDoc } = req;
  if (suggestionDoc.approvals.length < Requirements.MINIMUM_REQUIRED_APPROVALS) {
    throw new Error('Suggestion document doesn\'t have enough approvals to be merged.');
  }
  return next();
};