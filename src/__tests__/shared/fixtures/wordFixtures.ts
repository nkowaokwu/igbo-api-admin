import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import { WordData, WordDialect, DefinitionSchema } from 'src/backend/controllers/utils/interfaces';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';

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

export const wordFixture = (data?: Partial<WordData>): WordData => ({
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

export const dialectFixture = (data?: Partial<WordDialect>): WordDialect => ({
  dialects: [],
  id: '6596ca4a6fab49612273b724',
  pronunciation: '',
  variations: [],
  word: '',
  ...data,
});
