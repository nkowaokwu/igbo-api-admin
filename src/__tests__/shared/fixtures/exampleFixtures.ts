import { Types } from 'mongoose';
import { Example, ExampleData } from 'src/backend/controllers/utils/interfaces';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';

export const exampleFixture = (data?: Partial<Example>): ExampleData => ({
  id: `${new Types.ObjectId()}`,
  associatedDefinitionsSchemas: [],
  associatedWords: [],
  english: '',
  igbo: '',
  meaning: '',
  nsibidi: '',
  nsibidiCharacters: [],
  pronunciations: [],
  type: SentenceTypeEnum.DATA_COLLECTION,
  source: SuggestionSourceEnum.INTERNAL,
  updatedAt: new Date(),
  ...data,
});
