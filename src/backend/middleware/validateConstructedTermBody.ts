import { Request, Response, NextFunction } from 'express';
import {
  every,
  has,
  map,
  partial,
  trim,
} from 'lodash';
import { REQUIRE_KEYS } from '../controllers/wordSuggestions';

export default (req: Request, res: Response, next: NextFunction): Response | void => {
  const { body: data } = req;
  if (!data.wordClass) {
    res.status(400);
    return res.send({ error: 'Word class is required' });
  }

  if (!data.definitions || !data.definitions.length) {
    res.status(400);
    return res.send({ error: 'At least one definition is required' });
  }

  if (!data.attributes.isConstructedTerm) {
    throw new Error('Word must be a constructed term');
  }

  if (!Array.isArray(data.definitions)) {
    data.definitions = data.definitions ? map(data.definitions.split(','), (definition) => trim(definition)) : [];
  }

  if (!every(REQUIRE_KEYS, partial(has, data))) {
    throw new Error('Required information is missing, double check your provided data');
  }
  return next();
};
