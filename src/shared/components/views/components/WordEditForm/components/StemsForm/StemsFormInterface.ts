import { Control } from 'react-hook-form';

interface StemsForm {
  stems: string[],
  setStems: (array: string[]) => void,
  control: Control,
};

export default StemsForm;
