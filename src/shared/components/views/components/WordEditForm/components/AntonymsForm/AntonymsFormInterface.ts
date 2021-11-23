import { Control } from 'react-hook-form';

interface AntonymsForm {
  errors: any,
  antonyms: string[],
  setAntonyms: (array: string[]) => void,
  control: Control,
  setValue: (key: string, value: any) => void,
};

export default AntonymsForm;
