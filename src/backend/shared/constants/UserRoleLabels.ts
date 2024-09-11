import UserRoles from 'src/backend/shared/constants/UserRoles';

const UserRoleLabels = {
  [UserRoles.ADMIN]: 'Admin',
  [UserRoles.MERGER]: 'Merger',
  [UserRoles.NSIBIDI_MERGER]: 'Nsịbịdị Merger',
  [UserRoles.EDITOR]: 'Editor',
  [UserRoles.CROWDSOURCER]: 'Crowdsourcer',
  [UserRoles.TRANSCRIBER]: 'Transcriber',
  [UserRoles.USER]: 'User',
};

export default UserRoleLabels;
