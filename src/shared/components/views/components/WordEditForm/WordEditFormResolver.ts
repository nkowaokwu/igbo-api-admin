import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Tense from 'src/backend/shared/constants/Tense';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import WordClass from 'src/backend/shared/constants/WordClass';
import { ExampleEditFormSchema } from '../ExampleEditForm/ExampleEditFormResolver';

const schema = yup.object().shape({
  attributes: yup.object().shape(Object.entries(WordAttributes).reduce((finalAttributes, [, { value }]) => ({
    ...finalAttributes,
    [value]: (value === WordAttributes.IS_SLANG.value || value === WordAttributes.IS_CONSTRUCTED_TERM.value)
      ? yup.boolean().optional()
      : yup.boolean(),
  }), {})),
  word: yup.string().required(),
  tags: yup.array().min(0).of(yup.object().shape({
    value: yup.string(),
    label: yup.string(),
  })),
  definitions: yup.array().min(1).of(yup.object().shape({
    wordClass: yup.object().shape({
      value: yup.mixed().oneOf(Object.values(WordClass).map(({ value }) => value)),
      label: yup.mixed().oneOf(Object.values(WordClass).map(({ label }) => label)),
    }).required(),
    nsibidi: yup.string().optional(),
    nsibidiCharacters: yup.array().min(0).of(yup.object().shape({
      id: yup.string(),
    })).optional(),
    definitions: yup.array().min(0).of(yup.object().shape({
      text: yup.string(),
    })),
    igboDefinitions: yup.array().min(0).of(yup.object().shape({
      igbo: yup.string().optional(),
      nsibidi: yup.string().optional(),
      nsibidiCharacters: yup.array().min(0).of(yup.object().shape({
        id: yup.string(),
      })).optional(),
    })).optional(),
  })),
  variations: yup.array().min(0).of(yup.object().shape({
    text: yup.string(),
  })),
  dialects: yup.array().min(0).of(yup.object().shape({
    dialects: yup.array().min(1).of(yup.string()),
    variations: yup.array().min(0).of(yup.string()).optional(),
    pronunciation: yup.string().optional(),
    word: yup.string(),
  })),
  tenses: yup.object().shape(Object.values(Tense).reduce((finalSchema, tenseValue) => ({
    ...finalSchema,
    [tenseValue.value]: yup.string().optional(),
  }), {})).optional(),
  stems: yup.array().min(0).of(yup.object().shape({
    id: yup.string(),
  })),
  relatedTerms: yup.array().min(0).of(yup.object().shape({
    id: yup.string(),
  })),
  pronunciation: yup.string().optional(),
  twitterPollId: yup.string().optional(),
  frequency: yup.number().min(1).max(5),
  examples: yup.array().min(0).of(ExampleEditFormSchema),
});

const resolver = (): any => ({
  resolver: yupResolver(schema),
});

export default resolver;
