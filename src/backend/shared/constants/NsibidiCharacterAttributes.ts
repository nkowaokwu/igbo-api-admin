import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';

// NsibidiCharacter characteristics
const NsibidiCharacterAttributes = {
  [NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]: {
    value: NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS,
    label: 'Has Legacy Characters',
  },
  [NsibidiCharacterAttributeEnum.IS_COMPOUND]: {
    value: NsibidiCharacterAttributeEnum.IS_COMPOUND,
    label: 'Is Compound',
  },
  [NsibidiCharacterAttributeEnum.IS_SIMPLIFIED]: {
    value: NsibidiCharacterAttributeEnum.IS_SIMPLIFIED,
    label: 'Is Simplified',
  },
  [NsibidiCharacterAttributeEnum.IS_NEW]: {
    value: NsibidiCharacterAttributeEnum.IS_NEW,
    label: 'Is New',
  },
  [NsibidiCharacterAttributeEnum.IS_RADICAL]: {
    value: NsibidiCharacterAttributeEnum.IS_RADICAL,
    label: 'Is Radical',
  },
};

export default NsibidiCharacterAttributes;
