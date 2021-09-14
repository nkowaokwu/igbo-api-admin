import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface DialectForm {
  dialect: string,
  dialectLabel: string,
  formData: any,
  record: Record,
  control: Control,
  getValues: () => any,
  setValue: (key: string, value: string) => void,
  updateSelectedDialects: (value: string) => void,
  originalRecord: any,
};

export default DialectForm;
