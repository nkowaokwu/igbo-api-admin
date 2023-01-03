import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';

interface ExamplesFormInterface {
  examples: ExampleSuggestion[],
  setExamples: (value: any) => void,
  getValues: () => any,
  setValue: (key: string, value: any) => void,
  definitionGroupId: string,
};

export default ExamplesFormInterface;
