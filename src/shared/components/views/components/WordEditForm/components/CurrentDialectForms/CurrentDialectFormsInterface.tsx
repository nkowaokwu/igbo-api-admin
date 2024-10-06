import { Record } from 'react-admin';
import { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { WordDialect } from 'src/backend/controllers/utils/interfaces';

interface CurrentDialectForms {
  errors: any;
  record: Record;
  originalRecord: Record;
  control: Control;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  setDialects: (value: ({ word: string } & WordDialect)[]) => void;
  dialects: ({ word: string } & WordDialect)[];
}

export default CurrentDialectForms;
