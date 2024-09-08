import mongoose from 'mongoose';
import { toJSONPlugin, toObjectPlugin } from 'src/backend/models/plugins';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';

const { Schema } = mongoose;

export const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: { type: String, enum: Object.values(EntityStatus), required: true },
    visibility: { type: String, enum: Object.values(VisibilityType), default: VisibilityType.UNSPECIFIED },
    license: { type: String, enum: Object.values(LicenseType), default: LicenseType.UNSPECIFIED },
  },
  {
    toObject: toObjectPlugin,
    timestamps: true,
  },
);

toJSONPlugin(projectSchema);

mongoose.model('Project', projectSchema);
