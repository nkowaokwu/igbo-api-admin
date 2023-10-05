import mongoose from 'mongoose';
import { toObjectPlugin } from './plugins';

const { Schema, Types } = mongoose;

export const ReferralSchema = new Schema(
  {
    referrerId: { type: Types.ObjectId, ref: 'User' },
    referredUserId: { type: Types.ObjectId, ref: 'User' },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

mongoose.model('Referral', ReferralSchema);
