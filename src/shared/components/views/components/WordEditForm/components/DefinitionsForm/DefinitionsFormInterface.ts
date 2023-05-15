import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface DefinitionsForm {
  errors: any,
  control: Control,
  record: Record,
};

export default DefinitionsForm;
