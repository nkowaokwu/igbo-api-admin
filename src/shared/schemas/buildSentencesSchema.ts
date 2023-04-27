import Joi from 'joi';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

export const bulkSentencesSchema = Joi.array().items(
  Joi.object({
    igbo: Joi.string().required(),
    // https://stackoverflow.com/questions/42370881/allow-string-to-be-null-or-empty-in-joi-and-express-validation
    english: Joi.string().empty(''),
    style: Joi.string().valid(...Object.values(ExampleStyle).map(({ value }) => value)),
    type: Joi.string().valid(...Object.values(SentenceType)).required(),
  }),
);
