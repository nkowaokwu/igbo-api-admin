import { Control, UseFormGetValues } from 'react-hook-form';

interface TagsForm {
  errors: any;
  control: Control;
  getValues: UseFormGetValues<any>;
}

export default TagsForm;
