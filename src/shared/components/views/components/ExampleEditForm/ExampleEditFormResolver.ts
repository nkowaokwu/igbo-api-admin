import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

export const ExampleEditFormSchema = yup.object().shape({
  igbo: yup.string().required(),
  english: yup.string(),
  meaning: yup.string().optional(),
  nsibidi: yup.string().optional(),
  nsibidiCharacters: yup.array().min(0).of(yup.object().shape({
    id: yup.string(),
  })).optional(),
  style: yup.object().shape({
    value: yup.mixed().oneOf(Object.values(ExampleStyle).map(({ value }) => value)),
    label: yup.mixed().oneOf(Object.values(ExampleStyle).map(({ label }) => label)),
  }).required(),
  associatedWords: yup.array().min(0).of(yup.object().shape({
    id: yup.string(),
  })),
  associatedDefinitionsSchemas: yup.array().min(0).of(yup.string()),
  id: yup.string().optional(),
  exampleId: yup.string().optional(),
  originalExampleId: yup.string().nullable().optional(),
  pronunciations: yup.array().of(yup.object().shape({
    audio: yup.string(),
    speaker: yup.string().optional(),
  })),
});

const resolver = {
  resolver: yupResolver(ExampleEditFormSchema),
};

export default resolver;
