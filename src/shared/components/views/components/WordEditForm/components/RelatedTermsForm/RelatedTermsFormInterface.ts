import { Record } from 'react-admin';
import { Control } from 'react-hook-form';
import { Word } from 'src/backend/controllers/utils/interfaces';

interface RelatedTermsForm {
  errors: any,
  relatedTerms: string[],
  setRelatedTerms: (array: string[]) => void,
  control: Control,
  setValue: (key: string, value: any) => void,
  record: Record | Word,
};

export default RelatedTermsForm;
