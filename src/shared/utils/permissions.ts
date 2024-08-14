import UserRoles from 'src/backend/shared/constants/UserRoles';
import { betaEmailList } from 'src/shared/constants/emailList';
import { adminRoles, mergerRoles, editorRoles, crowdsourcerRoles } from 'src/backend/shared/constants/RolePermissions';

export const hasNoEditorPermissions = <T extends unknown>(
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: T,
): any | void => {
  if (!editorRoles.includes(permissions?.role)) {
    return returnWithPermission;
  }
  return null;
};

export const hasEditorPermissions = <T extends unknown>(
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: T,
): any | void => {
  if (editorRoles.includes(permissions?.role)) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminOrMergerPermissions = <T extends unknown>(
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: T,
): any | void => {
  if (mergerRoles.includes(permissions?.role)) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminPermissions = <T extends unknown>(
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: T,
): any | null => {
  if (adminRoles.includes(permissions?.role)) {
    return returnWithPermission;
  }
  return null;
};

export const hasBetaPermissions = <T extends unknown>(
  permissions: { role?: UserRoles; email?: string } = { role: UserRoles.USER, email: '' },
  returnWithPermission: T,
): any | null => {
  if (adminRoles.includes(permissions?.role) || betaEmailList.includes(permissions?.email)) {
    return returnWithPermission;
  }
  return null;
};

export const hasTranscriberPermissions = <T extends unknown>(
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: T,
): any | null => {
  if (permissions?.role === UserRoles.TRANSCRIBER || hasBetaPermissions(permissions, true)) {
    return returnWithPermission;
  }
  return null;
};

export const hasAtLeastCrowdsourcerPermissions = <T extends unknown>(
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: T,
): any | null => {
  if (crowdsourcerRoles.includes(permissions?.role) || hasBetaPermissions(permissions, true)) {
    return returnWithPermission;
  }
  return null;
};

export const hasAccessToPlatformPermissions = <T extends unknown>(
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: T,
): any | null => {
  if (Object.values(UserRoles).includes(permissions?.role) && permissions?.role !== UserRoles.USER) {
    return returnWithPermission;
  }
  return null;
};

export const hasCrowdsourcerPermission = <T extends unknown>(
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: T,
): any | null => {
  if (permissions?.role === UserRoles.CROWDSOURCER) {
    return returnWithPermission;
  }
  return null;
};
