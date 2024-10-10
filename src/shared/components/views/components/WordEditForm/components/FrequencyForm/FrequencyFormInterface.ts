import { Control, UseFormGetValues } from 'react-hook-form';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

interface FrequencyForm {
  errors: any;
  control: Control;
  record: Interfaces.Word;
  watch: any;
  getValues: UseFormGetValues<any>;
  onChange: (value?: any) => void;
}

export default FrequencyForm;
