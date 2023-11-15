import mongoose from 'mongoose';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import { toJSONPlugin, toObjectPlugin } from './plugins';

export const crowdsourcerSchema = new mongoose.Schema(
  {
    firebaseId: { type: String, index: true },
    referralCode: { type: String, index: true },
    age: { type: Date, default: null },
    dialects: [{ type: String, enum: Object.values(DialectEnum), default: [DialectEnum.UNSPECIFIED] }],
    gender: { type: String, enum: Object.values(GenderEnum), default: GenderEnum.UNSPECIFIED },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(crowdsourcerSchema);

mongoose.model('Crowdsourcer', crowdsourcerSchema);
