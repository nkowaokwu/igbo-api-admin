import UserRoles from 'src/backend/shared/constants/UserRoles';
import { betaEmailList } from 'src/shared/constants/emailList';

export const hasNoEditorPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | void => {
  if (
    permissions?.role !== UserRoles.ADMIN
    && permissions?.role !== UserRoles.MERGER
    && permissions?.role !== UserRoles.EDITOR
  ) {
    return returnWithPermission;
  }
  return null;
};

export const hasEditorPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | void => {
  if (
    permissions?.role === UserRoles.ADMIN
    || permissions?.role === UserRoles.MERGER
    || permissions?.role === UserRoles.EDITOR
  ) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminOrMergerPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | void => {
  if (permissions?.role === UserRoles.ADMIN || permissions?.role === UserRoles.MERGER) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | null => {
  if (permissions?.role === UserRoles.ADMIN) {
    return returnWithPermission;
  }
  return null;
};

export const hasBetaPermissions = (
  permissions: { role?: string, email?: string } = { role: '', email: '' },
  returnWithPermission: any,
): any | null => {
  if (permissions?.role === UserRoles.ADMIN || betaEmailList.includes(permissions?.email)) {
    return returnWithPermission;
  }
  return null;
};

export const hasTranscriberPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | null => {
  if (
    permissions?.role === UserRoles.TRANSCRIBER
    || hasBetaPermissions(permissions, true)
  ) {
    return returnWithPermission;
  }
  return null;
};
