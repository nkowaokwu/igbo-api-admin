import React, { ReactElement } from 'react';
import { Box, Checkbox, chakra } from '@chakra-ui/react';
import { Control, Controller, UseFormGetValues } from 'react-hook-form';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';
import { Record } from 'react-admin';

const CharacterAttributesForm = ({
  record,
  getValues,
  control,
}: {
  record: Record;
  getValues: UseFormGetValues<any>;
  control: Control;
}): ReactElement => (
  <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-4">
    {Object.values(NsibidiCharacterAttributeEnum).map((nsibidiCharacterAttribute) => (
      <Controller
        render={({ field: { onChange, value, ref } }) => (
          <Checkbox
            onChange={(e) => onChange(e.target.checked)}
            isChecked={value}
            defaultChecked={record.attributes?.[nsibidiCharacterAttribute]}
            ref={ref}
            data-test={`${nsibidiCharacterAttribute}-checkbox`}
            name={`${nsibidiCharacterAttribute}-checkbox`}
            size="lg"
            mr={3}
          >
            <chakra.span className="font-bold" fontFamily="Silka">
              {NsibidiCharacterAttributes[nsibidiCharacterAttribute].label}
            </chakra.span>
          </Checkbox>
        )}
        defaultValue={
          record.attributes?.[nsibidiCharacterAttribute] || getValues().attributes?.[nsibidiCharacterAttribute]
        }
        name={`attributes.${nsibidiCharacterAttribute}`}
        control={control}
      />
    ))}
  </Box>
);

export default CharacterAttributesForm;
