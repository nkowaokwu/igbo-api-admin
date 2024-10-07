import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LicenseType from 'src/backend/shared/constants/LicenseType';
import VisibilityType from 'src/backend/shared/constants/VisibilityType';

export const getProjectByIdHelper = jest.fn(() => ({
  title: 'Test project',
  description: 'Description of project',
  status: EntityStatus.ACTIVE,
  visibility: VisibilityType.PUBLIC,
  license: LicenseType.CC_BY,
  languages: [LanguageEnum.IGBO],
}));

export const getProjects = jest.fn();

export const postProject = jest.fn();

export const putProject = jest.fn();

export const getProjectById = jest.fn();
