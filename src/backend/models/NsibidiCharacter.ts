import mongoose from 'mongoose';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';
import WordClass from 'src/backend/shared/constants/WordClass';
import { toJSONPlugin } from './plugins';

const { Schema, Types } = mongoose;

export const nsibidiCharacterSchema = new Schema({
  nsibidi: { type: String, required: true, index: true },
  definitions: { type: [{ text: String }], default: [] },
  pronunciation: { type: String, default: '' },
  radicals: { type: [{ id: { type: Types.ObjectId, ref: 'NsibidiCharacter' } }], default: [] },
  attributes: Object.values(NsibidiCharacterAttributes).reduce(
    (finalAttributes, { value }) => ({
      ...finalAttributes,
      [value]: { type: Boolean, default: false },
    }),
    {},
  ),
  wordClass: {
    type: String,
    default: WordClass.NNC.nsibidiValue,
    enum: Object.values(WordClass).map(({ nsibidiValue }) => nsibidiValue),
  },
});

toJSONPlugin(nsibidiCharacterSchema);

mongoose.model('NsibidiCharacter', nsibidiCharacterSchema);
