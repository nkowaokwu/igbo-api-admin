import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface NsidibiForm {
  control: Control,
  record: Record,
  getValues: (key?: string) => any,
  setValue: (key: string, value: any) => void,
  name?: string,
  errors: any,
  hideFormHeader?: boolean,
  defaultValue?: any,
  placeholder?: string,
};

export default NsidibiForm;
