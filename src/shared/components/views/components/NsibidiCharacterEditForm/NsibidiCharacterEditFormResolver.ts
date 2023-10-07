import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';

const schema = yup.object().shape({
  nsibidi: yup.string().required(),
  attributes: yup.object().shape(
    Object.entries(NsibidiCharacterAttributes).reduce(
      (finalAttributes, [, { value }]) => ({
        ...finalAttributes,
        [value]: yup.boolean(),
      }),
      {},
    ),
  ),
  radicals: yup
    .array()
    .min(0)
    .of(
      yup.object().shape({
        id: yup.string(),
      }),
    )
    .optional(),
});

const resolver = (): any => ({
  resolver: yupResolver(schema),
});

export default resolver;
