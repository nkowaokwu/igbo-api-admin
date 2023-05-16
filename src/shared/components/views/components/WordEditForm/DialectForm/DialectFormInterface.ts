import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { WordDialect } from 'src/backend/controllers/utils/interfaces';

interface DialectForm {
  index: number,
  errors: { [key: string]: any },
  record: Record,
  control: Control,
  setDialects: (value: ({ word: string } & WordDialect)[]) => void,
  dialects: ({ word: string } & WordDialect)[],
  originalRecord: any,
};

export default DialectForm;
