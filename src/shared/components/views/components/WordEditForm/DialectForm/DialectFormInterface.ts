import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { WordDialect } from 'src/backend/controllers/utils/interfaces';

interface DialectForm {
  index: number,
  record: Record,
  control: Control,
  getValues: (key?: string) => any,
  setValue: (key: string, value: any) => any,
  setDialects: (value: ({ word: string } & WordDialect)[]) => void,
  dialects: ({ word: string } & WordDialect)[],
  originalRecord: any,
};

export default DialectForm;
