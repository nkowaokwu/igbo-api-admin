import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';

const schema = Joi.object({
  nsibidi: Joi.string().required(),
  attributes: Joi.object(
    Object.entries(NsibidiCharacterAttributes).reduce(
      (finalAttributes, [, { value }]) => ({
        ...finalAttributes,
        [value]: Joi.boolean(),
      }),
      {},
    ),
  ),
  radicals: Joi.array()
    .min(0)
    .items(
      Joi.object({
        id: Joi.string(),
      }),
    )
    .optional(),
});

const resolver = (): any => ({
  resolver: joiResolver(schema),
});

export default resolver;
