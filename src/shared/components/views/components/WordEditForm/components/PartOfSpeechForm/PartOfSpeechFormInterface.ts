import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface PartOfSpeechForm {
  errors: any;
  control: Control;
  groupIndex: number;
  record: Record;
}

export default PartOfSpeechForm;
