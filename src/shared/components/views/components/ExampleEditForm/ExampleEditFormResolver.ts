import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const ExampleEditFormSchema = yup.object().shape({
  igbo: yup.string(),
  english: yup.string(),
  associatedWords: yup.array().min(0).of(yup.string()),
  id: yup.string().optional(),
  originalExampleId: yup.string().nullable().optional(),
  pronunciation: yup.string().optional(),
});

const resolver = {
  resolver: yupResolver(ExampleEditFormSchema),
};

export default resolver;
