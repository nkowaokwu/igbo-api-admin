import { cloneDeep } from 'lodash';
import { ProjectData } from 'src/backend/controllers/utils/interfaces';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';

export const projectFixture = (data?: Partial<ProjectData>) => ({
  id: 'project-id',
  title: 'Project',
  description: 'Project description',
  status: EntityStatus.ACTIVE,
  visibility: VisibilityType.PUBLIC,
  license: LicenseType.CC_BY,
  ...cloneDeep(data),
});
