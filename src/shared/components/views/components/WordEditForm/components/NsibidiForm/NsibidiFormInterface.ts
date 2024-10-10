import { Control, UseFormGetValues } from 'react-hook-form';

interface NsidibiForm {
  control: Control;
  getValues: UseFormGetValues<any>;
  name?: string;
  errors: any;
  hideFormHeader?: boolean;
  placeholder?: string;
  defaultValue?: any;
}

export default NsidibiForm;
