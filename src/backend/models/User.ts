import mongoose from 'mongoose';
import { toObjectPlugin } from './plugins';

export const UserSchema = new mongoose.Schema(
  {
    firebaseId: { type: String, index: true },
    referralCode: { type: String, index: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

mongoose.model('User', UserSchema);
