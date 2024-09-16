import UserRoles from 'src/backend/shared/constants/UserRoles';

const UserRoleLabels = {
  [UserRoles.ADMIN]: {
    label: 'Admin',
    value: UserRoles.ADMIN,
  },
  [UserRoles.MERGER]: {
    label: 'Merger',
    value: UserRoles.MERGER,
  },
  [UserRoles.NSIBIDI_MERGER]: {
    label: 'Nsịbịdị Merger',
    value: UserRoles.NSIBIDI_MERGER,
  },
  [UserRoles.EDITOR]: {
    label: 'Editor',
    value: UserRoles.EDITOR,
  },
  [UserRoles.CROWDSOURCER]: {
    label: 'Crowdsourcer',
    value: UserRoles.CROWDSOURCER,
  },
  [UserRoles.TRANSCRIBER]: {
    label: 'Transcriber',
    value: UserRoles.TRANSCRIBER,
  },
  [UserRoles.USER]: {
    label: 'User',
    value: UserRoles.USER,
  },
};

export default UserRoleLabels;
