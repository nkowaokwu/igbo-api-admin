import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import SuggestionSource from '../shared/constants/SuggestionSource';
import ExampleStyle from '../shared/constants/ExampleStyle';

const { Types } = mongoose;
export const exampleDataSchema = Joi.object().keys({
  originalExampleId: Joi.string().external(async (value) => {
    if (value && !Types.ObjectId.isValid(value)) {
      throw new Error('Invalid original example id provided');
    }
    return true;
  }).allow(null).optional(),
  igbo: Joi.string(),
  english: Joi.string().allow(''),
  meaning: Joi.string().allow('').optional(),
  nsibidi: Joi.string().allow('').optional(),
  style: Joi.string().valid(...Object.values(ExampleStyle).map(({ value }) => value)).optional(),
  associatedWords: Joi.array().external((associatedWords) => {
    if (!associatedWords) {
      return true;
    }
    const isEveryAssociatedWordIdValid = associatedWords.every((wordId) => Types.ObjectId.isValid(wordId));
    if (!isEveryAssociatedWordIdValid) {
      throw new Error('Invalid associated word id');
    }
    return true;
  }),
  associatedDefinitionsSchemas: Joi.array().external((associatedDefinitionsSchemas) => {
    if (!associatedDefinitionsSchemas) {
      return true;
    }
    const isEveryAssociatedDefinitionsSchemaIdValid = (
      associatedDefinitionsSchemas.every((definitionsSchemaId) => Types.ObjectId.isValid(definitionsSchemaId))
    );
    if (!isEveryAssociatedDefinitionsSchemaIdValid) {
      throw new Error('Invalid associated definition schema id');
    }
    return true;
  }).allow(null).optional(),
  pronunciation: Joi.string().allow(''),
  exampleForSuggestion: Joi.boolean().optional(),
  editorsNotes: Joi.string().allow('').optional(),
  userComments: Joi.string().allow('').optional(),
  authorId: Joi.string().allow('').optional(),
  source: Joi.string().valid(...Object.values(SuggestionSource)).optional(),
});

export default async (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await exampleDataSchema.validateAsync(finalData, { abortEarly: false });
    return next();
  } catch (err) {
    res.status(400);
    if (err.details) {
      const errorMessage = err.details.map(({ message }) => message).join('. ');
      return res.send({ error: errorMessage });
    }
    return res.send({ error: err.message });
  }
};
