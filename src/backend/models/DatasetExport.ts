import mongoose from 'mongoose';
import { toObjectPlugin } from 'src/backend/models/plugins';

const { Schema, Types } = mongoose;

export const datasetExportSchema = new Schema(
  {
    fileName: { type: String, required: true, index: true },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
  },
  { toObject: toObjectPlugin, timestamps: true },
);

mongoose.model('DatasetExport', datasetExportSchema);
