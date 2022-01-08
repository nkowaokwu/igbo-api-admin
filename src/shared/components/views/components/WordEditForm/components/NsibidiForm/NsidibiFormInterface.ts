import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface NsidibiForm {
  errors: any,
  control: Control,
  record: Record,
  getValues: (key: string) => any,
};

export default NsidibiForm;
