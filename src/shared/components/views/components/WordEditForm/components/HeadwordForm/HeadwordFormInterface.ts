import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface HeadwordForm {
  errors: any,
  control: Control,
  record: Record,
  getValues: (key: string) => any,
};

export default HeadwordForm;
