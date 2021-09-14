import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface CurrentDialectForms {
  currentDialectView: string | string[],
  watchDialects: any,
  record: Record,
  originalRecord: Record,
  control: Control,
  getValues: () => any,
  setValue: (key: string, value: any) => void,
  updateSelectedDialects: (value: any) => void,
};

export default CurrentDialectForms;
