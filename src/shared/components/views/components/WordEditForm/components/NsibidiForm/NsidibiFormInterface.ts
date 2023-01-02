import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface NsidibiForm {
  control: Control,
  record: Record,
  getValues: (key?: string) => any,
  name?: string
};

export default NsidibiForm;
