import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { Word } from 'src/backend/controllers/utils/interfaces';

interface StemsForm {
  errors: any,
  control: Control,
  record: Record | Word,
};

export default StemsForm;
