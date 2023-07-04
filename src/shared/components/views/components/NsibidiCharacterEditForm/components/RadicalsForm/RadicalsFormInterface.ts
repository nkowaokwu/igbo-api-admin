import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { NsibidiCharacter } from 'src/backend/controllers/utils/interfaces';

interface RadicalsForm {
  errors: any;
  control: Control;
  record: Record | NsibidiCharacter;
}

export default RadicalsForm;
