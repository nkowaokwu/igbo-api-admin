import { Control } from 'react-hook-form';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

interface HeadwordForm {
  errors: any,
  control: Control,
  record: Interfaces.Word,
  watch: any,
  getValues: (key?: string) => any,
};

export default HeadwordForm;
