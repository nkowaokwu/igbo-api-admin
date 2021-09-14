import { Role } from '../constants/auth-types';

export const hasNoPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | void => {
  if (permissions.role !== Role.ADMIN && permissions.role !== Role.MERGER && permissions.role !== Role.EDITOR) {
    return returnWithPermission;
  }
  return false;
};

export const hasAdminOrMergerPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | void => {
  if (permissions.role === Role.ADMIN || permissions.role === Role.MERGER) {
    return returnWithPermission;
  }
  return false;
};

export const hasAdminPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | void => {
  if (permissions.role === Role.ADMIN) {
    return returnWithPermission;
  }
  return false;
};
