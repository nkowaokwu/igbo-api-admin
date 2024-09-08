import { Document, Types } from 'mongoose';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';

export interface ProjectData {
  id: Types.ObjectId | string;
  title: string;
  description: string;
  status: EntityStatus;
  visibility: VisibilityType;
  license: LicenseType;
}

export interface Project extends Document<ProjectData, any, ProjectData> {}
