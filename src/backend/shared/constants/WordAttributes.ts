import WordAttributeEnum from './WordAttributeEnum';

// Word characteristics
const WordAttributes = {
  [WordAttributeEnum.IS_STANDARD_IGBO]: {
    value: 'isStandardIgbo',
    label: 'Is Standard Igbo',
  },
  [WordAttributeEnum.IS_ACCENTED]: {
    value: 'isAccented',
    label: 'Is Accented',
  },
  [WordAttributeEnum.IS_COMPLETE]: {
    value: 'isComplete',
    label: 'Is Complete',
  },
  [WordAttributeEnum.IS_SLANG]: {
    value: 'isSlang',
    label: 'Is Slang',
  },
  [WordAttributeEnum.IS_CONSTRUCTED_TERM]: {
    value: 'isConstructedTerm',
    label: 'Is Constructed Term',
  },
  [WordAttributeEnum.IS_BORROWED_TERM]: {
    value: 'isBorrowedTerm',
    label: 'Is Borrowed Term',
  },
  [WordAttributeEnum.IS_STEM]: {
    value: 'isStem',
    label: 'Is Stem',
  },
  [WordAttributeEnum.IS_COMMON]: {
    value: 'isCommon',
    label: 'Is Common Term',
  },
};

export default WordAttributes;
