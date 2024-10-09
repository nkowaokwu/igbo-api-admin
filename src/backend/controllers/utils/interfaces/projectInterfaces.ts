import { Document, Types } from 'mongoose';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import ProjectType from 'src/backend/shared/constants/ProjectType';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';

export interface ProjectData {
  id: Types.ObjectId | string;
  title: string;
  description: string;
  status: EntityStatus;
  visibility: VisibilityType;
  license: LicenseType;
  languages: LanguageEnum[];
  types: ProjectType[];
}

export interface Project extends Document<ProjectData, any, ProjectData> {}
