import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface HeadwordForm {
  errors: any,
  control: Control,
  record: Record,
  watch: any,
  getValues: (key: string) => any,
  isConstructedTerm: boolean,
};

export default HeadwordForm;
