import { ProjectData, UserProjectPermission } from 'src/backend/controllers/utils/interfaces';
import Collection from 'src/shared/constants/Collection';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { request } from './utils/request';
import authProvider from '../utils/authProvider';

const FIREBASE_AUTH_ERROR = 'Firebase ID token has expired.';

export const postProject = async (project: Partial<ProjectData>): Promise<ProjectData> => {
  const { data: result } = await request<{ project: ProjectData }>({
    method: 'POST',
    url: `${Collection.PROJECTS}`,
    data: project,
  });
  return result.project;
};

export const getCurrentProject = async (): Promise<ProjectData> => {
  const projectId = window.localStorage.getItem(LocalStorageKeys.PROJECT_ID);

  const { data: result } = await request<{ project: ProjectData }>({
    method: 'GET',
    url: `${Collection.PROJECTS}/${projectId}`,
  }).catch((err) => {
    if (err?.response?.data?.error?.startsWith?.(FIREBASE_AUTH_ERROR)) {
      authProvider.logout();
    }
    return { data: null };
  });
  return result.project;
};

export const putCurrentProject = async (project: Partial<ProjectData>): Promise<ProjectData> => {
  const projectId = window.localStorage.getItem(LocalStorageKeys.PROJECT_ID);

  const { data: result } = await request<{ project: ProjectData }>({
    method: 'PUT',
    url: `${Collection.PROJECTS}/${projectId}`,
    data: project,
  });

  return result.project;
};

export const getAllUserProjects = async (): Promise<(ProjectData & { role: UserRoles })[]> => {
  const { data: result } = await request<{ projects: (ProjectData & { role: UserRoles })[] }>({
    method: 'GET',
    url: `${Collection.PROJECTS}/user`,
  });
  return result.projects;
};

export const getUserProjectPermission = async (): Promise<UserProjectPermission> => {
  const { data: result } = await request<{ userProjectPermission: UserProjectPermission }>({
    method: 'GET',
    url: `${Collection.USER_PROJECT_PERMISSIONS}`,
  });
  return result.userProjectPermission;
};

export const putUserProjectPermission = async (
  userProjectPermission: Partial<UserProjectPermission>,
): Promise<UserProjectPermission> => {
  const { data: result } = await request<{ userProjectPermission: UserProjectPermission }>({
    method: 'PUT',
    url: `${Collection.USER_PROJECT_PERMISSIONS}`,
    data: userProjectPermission,
  });
  return result.userProjectPermission;
};
