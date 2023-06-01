import mongoose, { Schema } from 'mongoose';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import LeaderboardType from '../shared/constants/LeaderboardType';

const userRankSchema = new Schema({
  uid: { type: String, required: true },
  count: { type: Number, default: -1 },
  position: { type: Number, default: -1 },
});

export const leaderboardSchema = new Schema(
  {
    rankings: { type: [{ type: userRankSchema }], default: [] },
    type: {
      type: String,
      enum: Object.values(LeaderboardType),
      required: true,
      index: true,
    },
    page: { type: Number, required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(leaderboardSchema);

mongoose.model('Leaderboard', leaderboardSchema);
