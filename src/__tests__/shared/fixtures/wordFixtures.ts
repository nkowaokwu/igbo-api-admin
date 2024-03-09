import { Types } from 'mongoose';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import { Word, WordData, WordDialect, DefinitionSchema } from 'src/backend/controllers/utils/interfaces';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';

export const definitionFixture = (data?: Partial<DefinitionSchema>): DefinitionSchema => {
  const objectId = new Types.ObjectId();
  return {
    wordClass: WordClassEnum.ADJ,
    definitions: [],
    label: '',
    igboDefinitions: [],
    nsibidi: '',
    nsibidiCharacters: [],
    id: `${objectId}`,
    _id: objectId,
    ...data,
  };
};

export const wordFixture = (data?: Partial<Word>): WordData => ({
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
  id: `${new Types.ObjectId()}`,
  ...data,
});

export const dialectFixture = (data?: Partial<WordDialect>): WordDialect => ({
  dialects: [],
  id: `${new Types.ObjectId()}`,
  pronunciation: '',
  variations: [],
  word: '',
  ...data,
});
