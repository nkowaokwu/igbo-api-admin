import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  isStandardIgbo: yup.boolean(),
  word: yup.string().required(),
  wordClass: yup.object().shape({
    value: yup.string().required(),
    label: yup.string().required(),
  }).required(),
  definitions: yup.mixed().test('definition-types', 'Definition is required', (value) => {
    if (Array.isArray(value)) {
      return value.length >= 1 && value[0].length >= 1;
    }
    if (typeof value === 'string') {
      return value.length >= 1;
    }
    return false;
  }),
  stems: yup.array().min(0).of(yup.string()),
  variations: yup.array().min(0).of(yup.string()),
  dialects: yup.object().shape({
    dialect: yup.string().optional(),
    word: yup.string().optional(),
    pronunciation: yup.string().optional(),
  }),
  synonyms: yup.array().min(0).of(yup.string()),
  antonyms: yup.array().min(0).of(yup.string()),
  pronunciation: yup.string().optional(),
  examples: yup.array().min(0).of(yup.object().shape({
    igbo: yup.string(),
    english: yup.string(),
    associatedWords: yup.array().min(0).of(yup.string()),
    id: yup.string().optional(),
    originalExampleId: yup.string().nullable().optional(),
  })),
  isComplete: yup.boolean(),
  nsibidi: yup.string(),
});

const resolver = (): any => ({
  resolver: yupResolver(schema),
});

export default resolver;
