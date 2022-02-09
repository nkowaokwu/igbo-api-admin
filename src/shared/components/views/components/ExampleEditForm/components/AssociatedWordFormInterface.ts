import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { Word } from 'src/backend/controllers/utils/interfaces';

interface AssociatedWordssForm {
  errors: any,
  associatedWords: string[],
  setAssociatedWords: (array: string[]) => void,
  control: Control,
  setValue: (key: string, value: any) => void,
  record: Record | Word,
};

export default AssociatedWordssForm;
