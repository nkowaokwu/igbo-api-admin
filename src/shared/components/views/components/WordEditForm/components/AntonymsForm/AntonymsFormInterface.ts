import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { Word } from '../../../../../../../backend/controllers/utils/interfaces';

interface AntonymsForm {
  errors: any,
  antonyms: string[],
  setAntonyms: (array: string[]) => void,
  control: Control,
  setValue: (key: string, value: any) => void,
  record: Record | Word,
};

export default AntonymsForm;
