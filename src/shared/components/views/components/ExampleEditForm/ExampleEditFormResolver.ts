import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

export const ExampleEditFormSchema = Joi.object({
  igbo: Joi.string().required(),
  english: Joi.string(),
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
  }).required(),
  associatedWords: Joi.array()
    .min(0)
    .items(
      Joi.object({
        id: Joi.string(),
      }),
    ),
  associatedDefinitionsSchemas: Joi.array().min(0).items(Joi.string()),
  id: Joi.string().optional(),
  exampleId: Joi.string().optional(),
  originalExampleId: Joi.string().allow(null).optional(),
  pronunciations: Joi.array().items(
    Joi.object({
      audio: Joi.string().allow(''),
      speaker: Joi.string().allow('').optional(),
      approvals: Joi.string().optional(),
      denials: Joi.string().optional(),
      archived: Joi.boolean(),
    }),
  ),
  editorsNotes: Joi.string().allow('').optional(),
});

const resolver = {
  resolver: joiResolver(ExampleEditFormSchema),
};

export default resolver;
