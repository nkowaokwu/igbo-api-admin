import mongoose from 'mongoose';
import moment from 'moment';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { toJSONPlugin, toObjectPlugin } from 'src/backend/models/plugins';

const { Schema, Types } = mongoose;

export const userProjectPermissionSchema = new Schema(
  {
    status: { type: String, enum: Object.values(EntityStatus), required: true },
    firebaseId: { type: String, default: '' },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
    email: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(UserRoles), required: UserRoles.CROWDSOURCER },
    activateBy: { type: Date, default: moment().add(1, 'week').toDate() },
    grantingAdmin: { type: String, required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

toJSONPlugin(userProjectPermissionSchema);

mongoose.model('ProjectUserPermission', userProjectPermissionSchema);
