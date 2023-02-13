import ReviewActions from 'src/backend/shared/constants/ReviewActions';

const CardMessageColor = {
  [ReviewActions.APPROVE]: 'green',
  [ReviewActions.DENY]: 'red',
  [ReviewActions.SKIP]: 'gray',
};

export default CardMessageColor;
