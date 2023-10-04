import mongoose from 'mongoose';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';
import WordClass from 'src/backend/shared/constants/WordClass';
import WordTagEnum from 'src/backend/shared/constants/WordTagEnum';
import { toJSONPlugin } from './plugins';

const { Schema, Types } = mongoose;

export const nsibidiCharacterSchema = new Schema({
  nsibidi: { type: String, required: true, index: true },
  definitions: { type: [{ text: String }], default: [] },
  pronunciation: { type: String, default: '' },
  radicals: { type: [{ id: { type: Types.ObjectId, ref: 'NsibidiCharacter' } }], default: [] },
  tags: {
    type: [String],
    default: [],
    validate: (v) => v.every((tag) => Object.values(WordTagEnum).includes(tag)),
  },
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
