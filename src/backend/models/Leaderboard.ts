import mongoose, { Schema } from 'mongoose';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import LeaderboardType from '../shared/constants/LeaderboardType';

const userRankSchema = new Schema({
  uid: { type: String, required: true },
  count: { type: Number, default: -1 },
  ranking: { type: Number, default: -1 },
});

export const leaderboardSchema = new Schema(
  {
    ranks: { type: [{ type: userRankSchema }], default: [] },
    type: {
      type: String,
      // Valid names: igbo_definitions or igbo_definitions_12
      // Allowing _<number> at the end of the type supports creating
      // multiple documents within the same type
      validate: (type) => {
        const regexes = Object.values(LeaderboardType).map((leaderboardType) => (
          // eslint-disable-next-line
          `(${leaderboardType}_\d*$)`
        )).join('|');
        return LeaderboardType[type] || new RegExp(regexes, 'g');
      },
      required: true,
      index: true,
    },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(leaderboardSchema);

mongoose.model('Leaderboard', leaderboardSchema);
