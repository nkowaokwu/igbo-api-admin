import UserRoles from 'src/backend/shared/constants/UserRoles';
import { betaEmailList } from 'src/shared/constants/emailList';

const AT_LEAST_ADMIN = [UserRoles.ADMIN];

const AT_LEAST_MERGER = [UserRoles.ADMIN, UserRoles.MERGER];

const AT_LEAST_EDITOR = [UserRoles.ADMIN, UserRoles.MERGER, UserRoles.EDITOR];

const AT_LEAST_CROWDSOURCER = [
  UserRoles.ADMIN,
  UserRoles.MERGER,
  UserRoles.EDITOR,
  UserRoles.TRANSCRIBER,
  UserRoles.CROWDSOURCER,
];

export const hasNoEditorPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any
): any | void => {
  if (!AT_LEAST_EDITOR.includes(permissions?.role)) {
    return returnWithPermission;
  }
  return null;
};

export const hasEditorPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any
): any | void => {
  if (AT_LEAST_EDITOR.includes(permissions?.role)) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminOrMergerPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any
): any | void => {
  if (AT_LEAST_MERGER.includes(permissions?.role)) {
    return returnWithPermission;
  }
  return null;
};

export const hasAdminPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any
): any | null => {
  if (AT_LEAST_ADMIN.includes(permissions?.role)) {
    return returnWithPermission;
  }
  return null;
};

export const hasBetaPermissions = (
  permissions: { role?: UserRoles; email?: string } = { role: UserRoles.USER, email: '' },
  returnWithPermission: any
): any | null => {
  if (AT_LEAST_ADMIN.includes(permissions?.role) || betaEmailList.includes(permissions?.email)) {
    return returnWithPermission;
  }
  return null;
};

export const hasTranscriberPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any
): any | null => {
  if (permissions?.role === UserRoles.TRANSCRIBER || hasBetaPermissions(permissions, true)) {
    return returnWithPermission;
  }
  return null;
};

export const hasAtLeastCrowdsourcerPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any
): any | null => {
  if (AT_LEAST_CROWDSOURCER.includes(permissions?.role) || hasBetaPermissions(permissions, true)) {
    return returnWithPermission;
  }
  return null;
};

export const hasAccessToPlatformPermissions = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any
): any | null => {
  if (Object.values(UserRoles).includes(permissions?.role) && permissions?.role !== UserRoles.USER) {
    return returnWithPermission;
  }
  return null;
};

export const hasCrowdsourcerPermission = (
  permissions: { role?: UserRoles } = { role: UserRoles.USER },
  returnWithPermission: any
): any | null => {
  if (permissions?.role === UserRoles.CROWDSOURCER) {
    return returnWithPermission;
  }
  return null;
};
