import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { Word } from 'src/backend/controllers/utils/interfaces';

interface AssociatedWordsForm {
  errors: any,
  control: Control,
  record: Record | Word,
};

export default AssociatedWordsForm;
