import { Control } from 'react-hook-form';

interface ExamplesForm {
  examples: any[],
  setExamples: (value: any) => void,
  getValues: () => any,
  control: Control,
};

export default ExamplesForm;
