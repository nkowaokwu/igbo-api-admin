import { Control } from 'react-hook-form';

interface SynonymsForm {
  errors: any,
  synonyms: string[],
  setSynonyms: (array: string[]) => void,
  control: Control,
  setValue: (key: string, value: any) => void,
};

export default SynonymsForm;
