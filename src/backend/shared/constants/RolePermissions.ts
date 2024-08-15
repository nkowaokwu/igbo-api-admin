import UserRoles from 'src/backend/shared/constants/UserRoles';
/** All permission levels granted including the lowest permission level. */

export const adminRoles = [UserRoles.ADMIN];

export const mergerRoles = [UserRoles.MERGER, UserRoles.ADMIN];

export const editorRoles = [UserRoles.EDITOR, UserRoles.NSIBIDI_MERGER, UserRoles.MERGER, UserRoles.ADMIN];

export const transcriberRoles = [
  UserRoles.EDITOR,
  UserRoles.MERGER,
  UserRoles.NSIBIDI_MERGER,
  UserRoles.ADMIN,
  UserRoles.TRANSCRIBER,
];

export const crowdsourcerRoles = [
  UserRoles.EDITOR,
  UserRoles.MERGER,
  UserRoles.NSIBIDI_MERGER,
  UserRoles.ADMIN,
  UserRoles.TRANSCRIBER,
  UserRoles.CROWDSOURCER,
];
