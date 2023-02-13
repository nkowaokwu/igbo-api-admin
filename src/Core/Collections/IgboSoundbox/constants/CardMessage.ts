import ReviewActions from 'src/backend/shared/constants/ReviewActions';

const CardMessage = {
  [ReviewActions.APPROVE]: 'You have marked this audio as approved',
  [ReviewActions.DENY]: 'You have marked this audio as denied',
  [ReviewActions.SKIP]: 'You have skipped this audio',
};

export default CardMessage;
