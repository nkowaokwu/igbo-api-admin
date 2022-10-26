import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import SuggestionSource from '../shared/constants/SuggestionSource';
import ExampleStyle from '../shared/constants/ExampleStyle';

const { Types } = mongoose;
const exampleDataSchema = Joi.object().keys({
  originalExampleId: Joi.string().external(async (value) => {
    if (value && !Types.ObjectId.isValid(value)) {
      throw new Error('Invalid original example id provided');
    }
    return true;
  }).allow(null).optional(),
  igbo: Joi.string(),
  english: Joi.string().allow(''),
  meaning: Joi.string().allow('').optional(),
  style: Joi.string().valid(...Object.values(ExampleStyle).map(({ value }) => value)).optional(),
  associatedWords: Joi.array().external(async (associatedWords) => {
    const isEveryAssociatedWordIdValid = associatedWords.every((wordId) => Types.ObjectId.isValid(wordId));
    if (!isEveryAssociatedWordIdValid) {
      throw new Error('Invalid associated word id');
    }
    return true;
  }),
  pronunciation: Joi.string().allow(''),
  exampleForSuggestion: Joi.boolean().optional(),
  editorsNotes: Joi.string().allow('').optional(),
  userComments: Joi.string().allow('').optional(),
  authorId: Joi.string().allow('').optional(),
  approvals: Joi.array().min(0).items(Joi.string()).optional(),
  denials: Joi.array().min(0).items(Joi.string()).optional(),
  source: Joi.string().valid(...Object.values(SuggestionSource)),
});

export default async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: finalData } = req;

  try {
    await exampleDataSchema.validateAsync(finalData, { abortEarly: false });
    return next();
  } catch (err) {
    res.status(400);
    return res.send({ error: err.message });
  }
};
