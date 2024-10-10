import { Record } from 'react-admin';
import { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { WordDialect } from 'src/backend/controllers/utils/interfaces';

interface DialectForm {
  index: number;
  errors: { [key: string]: any };
  record: Record;
  control: Control;

  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  setDialects: (value: ({ word: string } & WordDialect)[]) => void;
  dialects: ({ word: string } & WordDialect)[];
  originalRecord: any;
}

export default DialectForm;
