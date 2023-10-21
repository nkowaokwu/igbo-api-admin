import mongoose from 'mongoose';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import { toObjectPlugin } from './plugins';

export const crowdsourcerSchema = new mongoose.Schema(
  {
    firebaseId: { type: String, index: true },
    referralCode: { type: String, index: true },
    age: { type: Date, default: null },
    dialects: [{ type: String, enum: Object.values(DialectEnum), default: [] }],
    gender: { type: String, enum: Object.values(GenderEnum), default: GenderEnum.UNSPECIFIED },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

mongoose.model('Crowdsourcer', crowdsourcerSchema);
