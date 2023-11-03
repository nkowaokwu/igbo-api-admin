import GenderEnum from 'src/backend/shared/constants/GenderEnum';

export default {
  [GenderEnum.FEMALE]: {
    value: GenderEnum.FEMALE,
    label: 'Female',
  },
  [GenderEnum.MALE]: {
    value: GenderEnum.MALE,
    label: 'Male',
  },
  [GenderEnum.OTHER]: {
    value: GenderEnum.OTHER,
    label: 'Other',
  },
  [GenderEnum.PREFER_NOT_TO_SAY]: {
    value: GenderEnum.PREFER_NOT_TO_SAY,
    label: 'Prefer not to say',
  },
  [GenderEnum.UNSPECIFIED]: {
    value: GenderEnum.UNSPECIFIED,
    label: 'No gender selected',
  },
};
