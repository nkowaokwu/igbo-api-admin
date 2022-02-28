import { Control } from 'react-hook-form';
import { Example } from 'src/backend/controllers/utils/interfaces';

interface ExamplesFormInterface {
  examples: Example[],
  example: Example,
  setExamples: (value: any) => void,
  getValues: () => any,
  setValue: (key: string, value: any) => void,
  control: Control,
  index: number,
};

export default ExamplesFormInterface;
