import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import { WordData, WordDialect, DefinitionSchema, WordSuggestionData } from 'src/backend/controllers/utils/interfaces';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';

export const definitionFixture = (data?: Partial<DefinitionSchema>): DefinitionSchema => {
  return {
    wordClass: WordClassEnum.ADJ,
    definitions: [],
    label: '',
    igboDefinitions: [],
    nsibidi: '',
    nsibidiCharacters: [],
    id: '6596ca4a6fab49612273b724',
    ...data,
  };
};

export const wordFixture = (data?: Partial<WordData & { createdAt: Date }>): WordData & { createdAt: Date } => ({
  attributes: Object.values(WordAttributeEnum).reduce(
    (finalAttributes, attribute) => ({ ...finalAttributes, [attribute]: false }),
    {} as { [key in WordAttributeEnum]: boolean },
  ),
  conceptualWord: '',
  frequency: 1,
  hypernyms: [],
  hyponyms: [],
  pronunciation: '',
  relatedTerms: [],
  stems: [],
  updatedAt: new Date(),
  createdAt: new Date(),
  variations: [],
  normalized: '',
  word: '',
  wordPronunciation: '',
  definitions: [definitionFixture()],
  dialects: [],
  tags: [],
  id: '6596ca4a6fab49612273b724',
  ...data,
});

export const wordSuggestionFixture = (
  data?: Partial<WordSuggestionData & { createdAt: Date }>,
): WordSuggestionData & { createdAt: Date } => ({
  ...wordFixture(),
  approvals: [],
  denials: [],
  examples: [],
  merged: null,
  mergedBy: null,
  userInteractions: [],
  crowdsourcing: Object.values(CrowdsourcingType).reduce(
    (finalCrowdsourcing, crowdsourcing) => ({ ...finalCrowdsourcing, crowdsourcing }),
    {} as { [key in CrowdsourcingType]: boolean },
  ),
  ...data,
});

export const dialectFixture = (data?: Partial<WordDialect>): WordDialect => ({
  dialects: [],
  id: '6596ca4a6fab49612273b724',
  pronunciation: '',
  variations: [],
  word: '',
  ...data,
});
