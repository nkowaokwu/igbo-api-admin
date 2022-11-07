import { Record } from 'react-admin';
import { Control } from 'react-hook-form';

interface PartOfSpeechForm {
  errors: any,
  control: Control,
  record: Record,
  getValues: () => any,
  cacheForm: () => void,
  options: any,
  index: number,
};

export default PartOfSpeechForm;
