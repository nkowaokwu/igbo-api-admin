import UserRoles from 'src/backend/shared/constants/UserRoles';
/** All permission levels granted including the lowest permission level. */

export const anyRoles = [];

export const platformAdminRoles = [UserRoles.PLATFORM_ADMIN];

export const adminRoles = [UserRoles.ADMIN, UserRoles.PLATFORM_ADMIN];

export const mergerRoles = [UserRoles.MERGER, UserRoles.ADMIN, UserRoles.PLATFORM_ADMIN];

export const nsibidiMergerRoles = [
  UserRoles.NSIBIDI_MERGER,
  UserRoles.MERGER,
  UserRoles.ADMIN,
  UserRoles.PLATFORM_ADMIN,
];

export const editorRoles = [
  UserRoles.EDITOR,
  UserRoles.NSIBIDI_MERGER,
  UserRoles.MERGER,
  UserRoles.ADMIN,
  UserRoles.PLATFORM_ADMIN,
];

export const transcriberRoles = [
  UserRoles.TRANSCRIBER,
  UserRoles.EDITOR,
  UserRoles.MERGER,
  UserRoles.NSIBIDI_MERGER,
  UserRoles.ADMIN,
  UserRoles.PLATFORM_ADMIN,
];

export const transcriberOnlyRoles = [UserRoles.TRANSCRIBER, UserRoles.ADMIN, UserRoles.PLATFORM_ADMIN];

export const crowdsourcerRoles = [
  UserRoles.CROWDSOURCER,
  UserRoles.TRANSCRIBER,
  UserRoles.EDITOR,
  UserRoles.MERGER,
  UserRoles.NSIBIDI_MERGER,
  UserRoles.ADMIN,
  UserRoles.PLATFORM_ADMIN,
];
