import { Control } from 'react-hook-form';

interface VariationsForm {
  variations: string[],
  setVariations: (array: string[]) => void,
  control: Control,
};

export default VariationsForm;
