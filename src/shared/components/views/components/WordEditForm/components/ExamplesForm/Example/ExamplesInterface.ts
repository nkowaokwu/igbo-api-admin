import { Example } from 'src/backend/controllers/utils/interfaces';

interface ExamplesFormInterface {
  examples: Example[],
  example: Example,
  setExamples: (value: any) => void,
  getValues: (key?: string) => any,
  index: number,
  definitionGroupId?: string,
};

export default ExamplesFormInterface;
