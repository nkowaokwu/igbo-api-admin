import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';

const schema = Joi.object({
  title: Joi.string(),
  annotations: Joi.array().items(Joi.object()).optional(),
  body: Joi.string().optional(),
  media: Joi.string().allow(null),
  tags: Joi.array().min(0).items(Joi.string()),
  id: Joi.string().optional(),
});

const resolver = {
  resolver: joiResolver(schema),
};

export default resolver;
