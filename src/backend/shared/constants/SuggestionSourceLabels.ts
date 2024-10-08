import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';

const SuggestionSourceLabels = {
  [SuggestionSourceEnum.INTERNAL]: {
    value: SuggestionSourceEnum.INTERNAL,
    label: 'Igbo API Editor Platform',
  },
  [SuggestionSourceEnum.COMMUNITY]: {
    value: SuggestionSourceEnum.COMMUNITY,
    label: 'Nkọwa okwu',
  },
  [SuggestionSourceEnum.IGBO_SPEECH]: {
    value: SuggestionSourceEnum.IGBO_SPEECH,
    label: 'IgboSpeech',
  },
  [SuggestionSourceEnum.IGBO_WIKIMEDIANS]: {
    value: SuggestionSourceEnum.IGBO_WIKIMEDIANS,
    label: 'Igbo Wikimedians',
  },
  [SuggestionSourceEnum.BBC]: {
    value: SuggestionSourceEnum.BBC,
    label: 'BBC Igbo News',
  },
};

export default SuggestionSourceLabels;
