import React, { ReactElement } from 'react';
import { Box, Checkbox, chakra } from '@chakra-ui/react';
import { Control, Controller } from 'react-hook-form';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';
import { Record } from 'react-admin';

const CharacterAttributesForm = ({
  record,
  getValues,
  control,
}: {
  record: Record;
  getValues: () => any;
  control: Control;
}): ReactElement => (
  <Box className="mb-4">
    <Controller
      render={({ onChange, value, ref }) => (
        <Checkbox
          onChange={(e) => onChange(e.target.checked)}
          isChecked={value}
          defaultIsChecked={record.attributes?.[NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]}
          ref={ref}
          data-test={`${NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS}-checkbox`}
          size="lg"
        >
          <chakra.span className="font-bold" fontFamily="Silka">
            {NsibidiCharacterAttributes[NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS].label}
          </chakra.span>
        </Checkbox>
      )}
      defaultValue={
        record.attributes?.[NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS] ||
        getValues().attributes?.[NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]
      }
      name={`attributes.${NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS}`}
      control={control}
    />
  </Box>
);

export default CharacterAttributesForm;
