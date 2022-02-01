import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { WordDialect } from 'src/backend/controllers/utils/interfaces';

interface CurrentDialectForms {
  record: Record,
  originalRecord: Record,
  control: Control,
  getValues: () => any,
  setValue: (key: string, value: any) => void,
  setDialects: (value: ({ word: string } & WordDialect)[]) => void,
  dialects: ({ word: string } & WordDialect)[]
};

export default CurrentDialectForms;
