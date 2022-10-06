import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import WordClass from 'src/shared/constants/WordClass';

const constructedTermDataSchema = Joi.object().keys({
  word: Joi.string().required(),
  originalWordId: Joi.string().allow(null),
  wordClass: Joi.string().valid(...Object.values(WordClass).map((wordClass) => wordClass.value)).required(),
  definitions: Joi.array().min(1).required(),
  attributes: Joi.object({
    isConstructedTerm: Joi.boolean().invalid(false),
    isStandardIgbo: Joi.boolean(),
    isAccented: Joi.boolean(),
    isComplete: Joi.boolean(),
    isSlang: Joi.boolean(),
    isBorrowedTerm: Joi.boolean(),
  }),
  tags: Joi.array(),
  pronunciation: Joi.string().allow(''),
  variations: Joi.array(),
  userComments: Joi.string().allow(''),
  authorEmail: Joi.string().allow(''),
  authorId: Joi.string(),
  stems: Joi.array(),
  relatedTerms: Joi.array(),
  hypernyms: Joi.array(),
  hyponyms: Joi.array(),
  nsibidi: Joi.string().allow(''),
  approvals: Joi.array(),
  denials: Joi.array(),
  merged: Joi.string().allow(null),
  mergedBy: Joi.string().allow(null),
  userInteractions: Joi.array(),
  createdAt: Joi.string(),
  updatedAt: Joi.string(),
  id: Joi.string(),
  examples: Joi.array(),
  author: Joi.object({}).unknown(true),
  dialects: Joi.object({}).unknown(true),
  tenses: Joi.object({}).unknown(true),
});

export default async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { body: data } = req;
  try {
    await constructedTermDataSchema.validateAsync(data);
    return next();
  } catch (error) {
    throw new Error('Required information is missing, double check your provided data');
  }
};
