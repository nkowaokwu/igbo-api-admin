import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';

const SuggestionType = {
  [SentenceTypeEnum.DATA_COLLECTION]: {
    value: SentenceTypeEnum.DATA_COLLECTION,
    label: 'Data collection',
    isSelectable: true,
  },
  [SentenceTypeEnum.BIBLICAL]: {
    value: SentenceTypeEnum.BIBLICAL,
    label: 'Biblical',
    isSelectable: true,
  },
  [SentenceTypeEnum.DEFAULT]: {
    value: SentenceTypeEnum.DEFAULT,
    label: 'Default',
    isSelectable: false,
  },
};

export default SuggestionType;
