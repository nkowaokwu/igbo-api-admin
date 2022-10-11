import { Control } from 'react-hook-form';

interface ExamplesFormInterface {
  errors: any,
  examples: any[],
  setExamples: (value: any) => void,
  getValues: () => any,
  setValue: (key: string, value: any) => void,
  control: Control,
};

export default ExamplesFormInterface;
