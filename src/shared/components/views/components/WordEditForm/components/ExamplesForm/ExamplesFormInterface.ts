import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';

interface ExamplesFormInterface {
  examples: ExampleSuggestion[],
  setExamples: (value: any) => void,
  getValues: () => any,
  definitionGroupId: string,
};

export default ExamplesFormInterface;
