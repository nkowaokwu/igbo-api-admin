import { Example, PronunciationSchema, Translation } from 'src/backend/controllers/utils/interfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { parseAWSFilePathFromUri } from 'src/utils/parseAWS';

interface CleanedPronunciation {
  audio: string;
  speaker: string;
}

interface CleanedTranslation {
  text: string;
  language: LanguageEnum;
  pronunciations: CleanedPronunciation[];
}

export interface CleanedExample {
  source: CleanedTranslation;
  translations: CleanedTranslation[];
}

const cleanPronunciation = (pronunciation: PronunciationSchema) => ({
  audio: parseAWSFilePathFromUri(pronunciation.audio) || '',
  speaker: pronunciation.speaker,
});

const cleanTranslation = (translation: Translation) => ({
  text: translation.text,
  language: translation.language,
  pronunciations: translation.pronunciations.map(cleanPronunciation),
});

export const cleanExample = (example: Example): CleanedExample => ({
  source: cleanTranslation(example.source),
  translations: example.translations.map(cleanTranslation),
});
