import { cloneDeep } from 'lodash';
import { ExampleData, ExampleSuggestionData, Translation } from 'src/backend/controllers/utils/interfaces';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import {
  SentenceTranslation,
  SentenceTranslationVerification,
  SentenceTranslationVerificationPayload,
} from 'src/Core/Collections/IgboSoundbox/types/SoundboxInterfaces';

export const exampleFixture = (
  data?: Partial<ExampleData & { createdAt: Date }>,
): ExampleData & { createdAt: Date } => ({
  id: '6596ca4a6fab49612273b724',
  associatedDefinitionsSchemas: [],
  associatedWords: [],
  source: { language: LanguageEnum.UNSPECIFIED, text: '' },
  translations: [{ language: LanguageEnum.UNSPECIFIED, text: '' }],
  meaning: '',
  nsibidi: '',
  nsibidiCharacters: [],
  pronunciations: [],
  type: SentenceTypeEnum.DATA_COLLECTION,
  origin: SuggestionSourceEnum.INTERNAL,
  updatedAt: new Date(),
  createdAt: new Date(),
  ...cloneDeep(data),
});

export const exampleSuggestionFixture = (
  data?: Partial<ExampleSuggestionData>,
): ExampleSuggestionData & { createdAt: Date } => ({
  ...exampleFixture(),
  originalExampleId: '',
  exampleForSuggestion: false,
  origin: SuggestionSourceEnum.INTERNAL,
  editorsNotes: '',
  crowdsourcing: Object.values(CrowdsourcingType).reduce(
    (finalCrowdsourcing, crowdsourcing) => ({ ...finalCrowdsourcing, crowdsourcing }),
    {} as { [key in CrowdsourcingType]: boolean },
  ),
  ...cloneDeep(data),
});

export const exampleSuggestionTranslationFixture = (data?: Partial<SentenceTranslation>): SentenceTranslation => ({
  id: '',
  translations: [],
  ...cloneDeep(data),
});

export const exampleSuggestionTranslationReviewFixture = (
  data?: Partial<SentenceTranslationVerificationPayload>,
): SentenceTranslationVerificationPayload => ({
  id: '',
  translations: [],
  ...cloneDeep(data),
});

export const translationFixture = (data?: Partial<Translation>): Translation => ({
  _id: '',
  language: LanguageEnum.IGBO,
  text: '',
  pronunciations: [],
  approvals: [],
  denials: [],
  authorId: '',
  ...cloneDeep(data),
});
