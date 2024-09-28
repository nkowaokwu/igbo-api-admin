import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';

export interface SentenceVerification {
  id: string;
  reviews: { [pronunciationId: string]: ReviewActions };
}

export interface SentenceTranslationVerification {
  id: string;
  reviews: { [translationId: string]: ReviewActions };
}

export interface SentenceTranslationVerificationPayload {
  id: string;
  translations: { id: string; review: ReviewActions }[];
}

export interface SentenceTranslation {
  id: string;
  translations: Translation[];
}

export interface Translation {
  text: string;
  language: LanguageEnum;
  pronunciations: { audio: string }[];
}
