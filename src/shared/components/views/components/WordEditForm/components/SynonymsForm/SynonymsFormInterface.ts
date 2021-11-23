import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { Word } from '../../../../../../../backend/controllers/utils/interfaces';

interface SynonymsForm {
  errors: any,
  synonyms: string[],
  setSynonyms: (array: string[]) => void,
  control: Control,
  setValue: (key: string, value: any) => void,
  record: Record | Word,
};

export default SynonymsForm;
