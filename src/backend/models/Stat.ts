import mongoose, { Schema, Types } from 'mongoose';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import StatTypes from '../shared/constants/StatTypes';
import Author from '../shared/constants/Author';

export const statSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(StatTypes),
      index: true,
    },
    authorId: { type: String, default: Author.SYSTEM },
    value: { type: Schema.Types.Mixed, default: null },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(statSchema);

mongoose.model('Stat', statSchema);
