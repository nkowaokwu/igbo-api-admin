import { ExampleData } from 'src/backend/controllers/utils/interfaces';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';

export const exampleFixture = (data?: Partial<ExampleData>): ExampleData => ({
  id: '6596ca4a6fab49612273b724',
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
