import mongoose from 'mongoose';
import { toJSONPlugin, toObjectPlugin } from './plugins';

const { Schema, Types } = mongoose;

export const referralSchema = new Schema(
  {
    referrerId: { type: Types.ObjectId, ref: 'Crowdsourcer' },
    referredUserId: { type: Types.ObjectId, ref: 'Crowdsourcer' },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(referralSchema);
mongoose.model('Referral', referralSchema);
