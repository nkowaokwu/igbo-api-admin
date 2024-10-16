import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';

const PronunciationsSchema = Joi.array().items(
  Joi.object({
    audio: Joi.string().allow(''),
    speaker: Joi.string().allow('').optional(),
    archived: Joi.boolean(),
  }),
);

const TranslationFormSchema = Joi.object({
  language: Joi.alternatives().try(...Object.values(LanguageLabels)),
  text: Joi.string(),
  pronunciations: PronunciationsSchema,
});

export const ExampleEditFormSchema = Joi.object({
  source: TranslationFormSchema.required(),
  translations: Joi.array().min(0).items(TranslationFormSchema),
  meaning: Joi.string().allow('').optional(),
  nsibidi: Joi.string().allow('').optional(),
  nsibidiCharacters: Joi.array()
    .min(0)
    .items(
      Joi.object({
        id: Joi.string(),
      }),
    )
    .optional(),
  style: Joi.object({
    value: Joi.alternatives().try(...Object.values(ExampleStyle).map(({ value }) => value)),
    label: Joi.alternatives().try(...Object.values(ExampleStyle).map(({ label }) => label)),
  }),
  associatedWords: Joi.array()
    .min(0)
    .items(
      Joi.object({
        id: Joi.string(),
      }),
    ),
  associatedDefinitionsSchemas: Joi.array().min(0).items(Joi.string()),
  id: Joi.string().optional(),
  exampleId: Joi.string().allow('', null).optional(),
  originalExampleId: Joi.string().allow(null).optional(),
  editorsNotes: Joi.string().allow('').optional(),
});

const resolver = {
  resolver: joiResolver(ExampleEditFormSchema),
};

export default resolver;
