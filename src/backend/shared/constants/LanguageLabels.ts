import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

const LanguageLabels = {
  [LanguageEnum.UNSPECIFIED]: {
    value: LanguageEnum.UNSPECIFIED,
    label: 'Unspecified',
  },
  [LanguageEnum.ENGLISH]: {
    value: LanguageEnum.ENGLISH,
    label: 'English',
  },
  [LanguageEnum.HAUSA]: {
    value: LanguageEnum.HAUSA,
    label: 'Hausa',
  },
  [LanguageEnum.IGBO]: {
    value: LanguageEnum.IGBO,
    label: 'Igbo',
  },
  [LanguageEnum.YORUBA]: {
    value: LanguageEnum.YORUBA,
    label: 'Yoruba',
  },
};

export default LanguageLabels;
