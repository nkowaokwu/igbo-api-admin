import mongoose from 'mongoose';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';
import { toJSONPlugin } from './plugins';

const { Schema, Types } = mongoose;

export const nsibidiCharacterSchema = new Schema({
  nsibidi: { type: String, required: true, index: true },
  radicals: { type: [{ id: { type: Types.ObjectId, ref: 'NsibidiCharacter' } }], default: [] },
  attributes: Object.values(NsibidiCharacterAttributes).reduce(
    (finalAttributes, { value }) => ({
      ...finalAttributes,
      [value]: { type: Boolean, default: false },
    }),
    {},
  ),
});

toJSONPlugin(nsibidiCharacterSchema);

mongoose.model('NsibidiCharacter', nsibidiCharacterSchema);
