import { cloneDeep } from 'lodash';
import { ExampleData, ExampleSuggestionData } from 'src/backend/controllers/utils/interfaces';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';

export const exampleFixture = (
  data?: Partial<ExampleData & { createdAt: Date }>,
): ExampleData & { createdAt: Date } => ({
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
  createdAt: new Date(),
  ...cloneDeep(data),
});

export const exampleSuggestionFixture = (
  data?: Partial<ExampleSuggestionData>,
): ExampleSuggestionData & { createdAt: Date } => ({
  ...exampleFixture(),
  originalExampleId: '',
  exampleForSuggestion: false,
  source: SuggestionSourceEnum.INTERNAL,
  style: ExampleStyleEnum.NO_STYLE,
  editorsNotes: '',
  crowdsourcing: Object.values(CrowdsourcingType).reduce(
    (finalCrowdsourcing, crowdsourcing) => ({ ...finalCrowdsourcing, crowdsourcing }),
    {} as { [key in CrowdsourcingType]: boolean },
  ),
  ...cloneDeep(data),
});
