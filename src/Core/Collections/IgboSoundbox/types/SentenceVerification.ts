import ReviewActions from 'src/backend/shared/constants/ReviewActions';

export interface SentenceVerification {
  id: string,
  reviews: { [pronunciationId: string]: ReviewActions },
};
