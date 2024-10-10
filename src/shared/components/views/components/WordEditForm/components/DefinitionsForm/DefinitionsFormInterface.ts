import { Record } from 'react-admin';
import { Control, UseFormGetValues } from 'react-hook-form';

interface DefinitionsForm {
  errors: any;
  control: Control;
  record: Record;
  getValues: UseFormGetValues<any>;
}

export default DefinitionsForm;
