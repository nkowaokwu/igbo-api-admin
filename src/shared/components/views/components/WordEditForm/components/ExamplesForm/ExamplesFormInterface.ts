import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';

interface ExamplesFormInterface {
  examples: ExampleSuggestion[],
  setExamples: (value: any) => void,
  getValues: () => any,
};

export default ExamplesFormInterface;
