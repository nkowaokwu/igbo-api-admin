import mongoose from 'mongoose';
import moment from 'moment';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { toJSONPlugin, toObjectPlugin } from 'src/backend/models/plugins';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';

const { Schema, Types } = mongoose;

export const userProjectPermissionSchema = new Schema(
  {
    status: { type: String, enum: Object.values(EntityStatus), required: true },
    firebaseId: { type: String, default: '', index: true },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true, index: true },
    email: { type: String, required: true, trim: true, index: true },
    role: { type: String, enum: Object.values(UserRoles), required: UserRoles.CROWDSOURCER },
    activateBy: { type: Date, default: moment().add(1, 'week').toDate() },
    grantingAdmin: { type: String, required: true },
    languages: { type: [{ type: String, enum: Object.values(LanguageEnum) }], default: [] },
    gender: { type: String, enum: Object.values(GenderEnum), default: GenderEnum.UNSPECIFIED },
    age: { type: Date },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(userProjectPermissionSchema);

mongoose.model('UserProjectPermission', userProjectPermissionSchema);
