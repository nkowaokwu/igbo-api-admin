import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

export const ExampleEditFormSchema = yup.object().shape({
  igbo: yup.string().required(),
  english: yup.string(),
  meaning: yup.string().optional(),
  nsibidi: yup.string().optional(),
  style: yup.object().shape({
    value: yup.mixed().oneOf(Object.values(ExampleStyle).map(({ value }) => value)),
    label: yup.mixed().oneOf(Object.values(ExampleStyle).map(({ label }) => label)),
  }).required(),
  associatedWords: yup.array().min(0).of(yup.string()),
  id: yup.string().optional(),
  originalExampleId: yup.string().nullable().optional(),
  pronunciation: yup.string().optional(),
});

const resolver = {
  resolver: yupResolver(ExampleEditFormSchema),
};

export default resolver;
