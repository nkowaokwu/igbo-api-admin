import EntityStatus from 'src/backend/shared/constants/EntityStatus';

const EntityStatusBadge = {
  [EntityStatus.UNSPECIFIED]: {
    colorScheme: '',
  },
  [EntityStatus.INACTIVE]: {
    colorScheme: 'red',
  },
  [EntityStatus.PENDING]: {
    colorScheme: 'yellow',
  },
  [EntityStatus.ACTIVE]: {
    colorScheme: 'green',
  },
  [EntityStatus.SUSPENDED]: {
    colorScheme: 'yellow',
  },
  [EntityStatus.PAUSED]: {
    colorScheme: 'yellow',
  },
  [EntityStatus.DELETED]: {
    colorScheme: 'gray',
  },
};

export default EntityStatusBadge;
