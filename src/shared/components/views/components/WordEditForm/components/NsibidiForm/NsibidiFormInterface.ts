import { Control } from 'react-hook-form';

interface NsidibiForm {
  control: Control,
  name?: string,
  errors: any,
  hideFormHeader?: boolean,
  placeholder?: string,
  defaultValue?: any,
};

export default NsidibiForm;
