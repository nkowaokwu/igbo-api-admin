import { Role } from 'src/shared/constants/auth-types';
import { betaEmailList } from 'src/shared/constants/emailList';

export const hasNoPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | void => {
  if (permissions?.role !== Role.ADMIN && permissions?.role !== Role.MERGER && permissions?.role !== Role.EDITOR) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminOrMergerPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | void => {
  if (permissions?.role === Role.ADMIN || permissions?.role === Role.MERGER) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminPermissions = (
  permissions: { role?: string } = { role: '' },
  returnWithPermission: any,
): any | null => {
  if (permissions?.role === Role.ADMIN) {
    return returnWithPermission;
  }
  return null;
};

export const hasBetaPermissions = (
  permissions: { role?: string, email?: string } = { role: '', email: '' },
  returnWithPermission: any,
): any | null => {
  if (permissions?.role === Role.ADMIN || betaEmailList.includes(permissions?.email)) {
    return returnWithPermission;
  }
  return null;
};
