import mongoose, { Schema } from 'mongoose';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import StatTypes from '../shared/constants/StatTypes';

export const statSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(StatTypes),
      index: true.valueOf,
    },
    authorId: { type: String, default: 'SYSTEM' },
    value: { type: Schema.Types.Mixed, default: null },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(statSchema);

mongoose.model('Stat', statSchema);
