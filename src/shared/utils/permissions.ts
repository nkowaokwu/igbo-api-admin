import UserRoles from 'src/backend/shared/constants/UserRoles';
import { betaEmailList } from 'src/shared/constants/emailList';

export const hasNoEditorPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
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
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
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
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any,
): any | void => {
  if (permissions?.role === UserRoles.ADMIN || permissions?.role === UserRoles.MERGER) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any,
): any | null => {
  if (permissions?.role === UserRoles.ADMIN) {
    return returnWithPermission;
  }
  return null;
};

export const hasBetaPermissions = (
  permissions: { role?: UserRoles, email?: string } = { role: UserRoles.USER, email: '' },
  returnWithPermission: any,
): any | null => {
  if (permissions?.role === UserRoles.ADMIN || betaEmailList.includes(permissions?.email)) {
    return returnWithPermission;
  }
  return null;
};

export const hasTranscriberPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
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

export const hasAtLeastTranscriberPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any,
): any | null => {
  if (
    permissions?.role === UserRoles.TRANSCRIBER
    || permissions?.role === UserRoles.CROWDSOURCER
    || hasBetaPermissions(permissions, true)
  ) {
    return returnWithPermission;
  }
  return null;
};

export const hasAccessToPlatformPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any,
): any | null => {
  if (
    Object.values(UserRoles).includes(permissions?.role)
    && permissions?.role !== UserRoles.USER
  ) {
    return returnWithPermission;
  }
  return null;
};

export const hasCrowdsourcerPermission = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any,
): any | null => {
  if (permissions?.role === UserRoles.CROWDSOURCER) {
    return returnWithPermission;
  }
  return null;
};
