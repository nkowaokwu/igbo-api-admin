import { Document } from 'mongoose';

export interface DatasetExportData {
  fileName: string;
  projectId: string;
}

export interface DatasetExport extends Document, DatasetExportData {}
