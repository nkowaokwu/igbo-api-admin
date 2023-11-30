import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import Tense from 'src/backend/shared/constants/Tense';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import WordClass from 'src/backend/shared/constants/WordClass';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import WordTagEnum from 'src/backend/shared/constants/WordTagEnum';
import { ExampleEditFormSchema } from '../ExampleEditForm/ExampleEditFormResolver';

const schema = Joi.object({
  attributes: Joi.object(
    Object.entries(WordAttributes).reduce(
      (finalAttributes, [, { value }]) => ({
        ...finalAttributes,
        [value]:
          value === WordAttributeEnum.IS_SLANG || value === WordAttributeEnum.IS_CONSTRUCTED_TERM
            ? Joi.boolean().optional()
            : Joi.boolean(),
      }),
      {},
    ),
  ),
  word: Joi.string().required(),
  tags: Joi.array()
    .min(0)
    .items(
      Joi.object({
        value: Joi.alternatives().try(...Object.values(WordTagEnum)),
        label: Joi.string(),
      }),
    ),
  definitions: Joi.array()
    .min(1)
    .items(
      Joi.object({
        wordClass: Joi.object({
          value: Joi.alternatives().try(...Object.values(WordClass).map(({ value }) => value)),
          label: Joi.alternatives().try(...Object.values(WordClass).map(({ label }) => label)),
        }).required(),
        nsibidi: Joi.string().optional(),
        nsibidiCharacters: Joi.array()
          .min(0)
          .items(
            Joi.object({
              id: Joi.string(),
            }),
          )
          .optional(),
        definitions: Joi.array()
          .min(0)
          .items(
            Joi.object({
              text: Joi.string(),
            }),
          ),
        igboDefinitions: Joi.array()
          .min(0)
          .items(
            Joi.object({
              igbo: Joi.string().optional(),
              nsibidi: Joi.string().optional(),
              nsibidiCharacters: Joi.array()
                .min(0)
                .items(
                  Joi.object({
                    id: Joi.string(),
                  }),
                )
                .optional(),
            }),
          )
          .optional(),
      }),
    ),
  variations: Joi.array()
    .min(0)
    .items(
      Joi.object({
        text: Joi.string(),
      }),
    ),
  dialects: Joi.array()
    .min(0)
    .items(
      Joi.object({
        dialects: Joi.array().min(1).items(Joi.string()),
        variations: Joi.array().min(0).items(Joi.string()).optional(),
        pronunciation: Joi.string().optional(),
        word: Joi.string(),
      }),
    ),
  tenses: Joi.object(
    Object.values(Tense).reduce(
      (finalSchema, tenseValue) => ({
        ...finalSchema,
        [tenseValue.value]: Joi.string().optional(),
      }),
      {},
    ),
  ).optional(),
  stems: Joi.array()
    .min(0)
    .items(
      Joi.object({
        id: Joi.string(),
      }),
    ),
  relatedTerms: Joi.array()
    .min(0)
    .items(
      Joi.object({
        id: Joi.string(),
      }),
    ),
  pronunciation: Joi.string().optional(),
  twitterPollId: Joi.string().optional(),
  frequency: Joi.number().min(1).max(5),
  examples: Joi.array().min(0).items(ExampleEditFormSchema),
});

const resolver = (): any => ({
  resolver: joiResolver(schema),
});

export default resolver;
