import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { map, trim } from 'lodash';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import Dialects from 'src/backend/shared/constants/Dialects';
import WordClass from 'src/backend/shared/constants/WordClass';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import WordTags from '../shared/constants/WordTags';
import Tense from '../shared/constants/Tense';
import { exampleDataSchema } from './validateExampleBody';

const { Types } = mongoose;
export const wordDataSchema = Joi.object().keys({
  originalWordId: Joi.string().external(async (value) => {
    if (value && !Types.ObjectId.isValid(value)) {
      throw new Error('Invalid original word id provided');
    }
    return true;
  }).allow(null).optional(),
  word: Joi.string().required(),
  wordPronunciation: Joi.string().allow('', null).optional(),
  conceptualWord: Joi.string().allow('', null).optional(),
  nsibidi: Joi.string().allow(''),
  definitions: Joi.array().min(1).items(Joi.object().keys({
    wordClass: Joi.string().valid(...Object.keys(WordClass)).required(),
    definitions: Joi.array().min(1).items(Joi.string()).required(),
    igboDefinitions: Joi.array().min(0).items(Joi.string()).optional(),
    nsibidi: Joi.string().allow('').optional(),
    label: Joi.string().allow('').optional(),
  })).required(),
  attributes: Joi.object().keys(Object.values(WordAttributes).reduce((finalSchema, { value }) => ({
    ...finalSchema,
    [value]: Joi.boolean().optional(),
  }), {})),
  pronunciation: Joi.string().allow('').optional(),
  stems: Joi.array().min(0).items(Joi.string()).allow(null)
    .optional(),
  relatedTerms: Joi.array().min(0).items(Joi.string()).optional(),
  dialects: Joi.array().min(0).items(Joi.object().keys({
    variations: Joi.array().min(0).items(Joi.string()).optional(),
    dialects: Joi.array().min(0).items(Joi.string().valid(...Object.keys(Dialects))).required(),
    pronunciation: Joi.string().allow('').required(),
    word: Joi.string().allow('').required(),
  })),
  tags: Joi.array().items(Joi.string().valid(...Object.values(WordTags).map(({ value }) => value))),
  tenses: Joi.object().keys(Object.values(Tense).reduce((finalSchema, { value }) => ({
    ...finalSchema,
    [value]: Joi.string().allow('').optional(),
  }), {})).optional(),
  frequency: Joi.number().optional(),
  variations: Joi.array().min(0).items(Joi.string()),
  editorsNotes: Joi.string().allow('').optional(),
  userComments: Joi.string().allow('').optional(),
  examples: Joi.array().min(0).items(exampleDataSchema.append({
    id: Joi.string().external(async (value) => {
      if (value && !Types.ObjectId.isValid(value)) {
        throw new Error('Invalid original word id provided');
      }
      return true;
    }).allow(null).optional(),
  })).optional(),
});

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  // Trimming definitions
  if (!Array.isArray(finalData.definitions)) {
    finalData.definitions = finalData.definitions
      ? map(finalData.definitions.split(','), (definition) => trim(definition))
      : [];
  }

  try {
    await wordDataSchema.validateAsync(finalData, { abortEarly: false });
    return next();
  } catch (err) {
    res.status(400);
    if (err.details) {
      const errorMessage = err.details.map(({ message }) => message).join('. ');
      return res.send({ message: errorMessage });
    }
    return res.send({ message: err.message });
  }
};
