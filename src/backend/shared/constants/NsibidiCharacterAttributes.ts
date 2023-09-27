import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';

// NsibidiCharacter characteristics
const NsibidiCharacterAttributes = {
  [NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]: {
    value: NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS,
    label: 'Has Legacy Characters',
  },
  [NsibidiCharacterAttributeEnum.IS_RADICAL]: {
    value: NsibidiCharacterAttributeEnum.IS_RADICAL,
    label: 'Is Radical',
  },
};

export default NsibidiCharacterAttributes;
