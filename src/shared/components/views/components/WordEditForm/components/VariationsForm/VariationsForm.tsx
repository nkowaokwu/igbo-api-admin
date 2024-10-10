import React, { ReactElement } from 'react';
import { Box, Button, IconButton } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Controller, useFieldArray } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import FormHeader from '../../../FormHeader';
import VariationsFormInterface from './VariationsFormInterface';

const VariationsForm = ({ control }: VariationsFormInterface): ReactElement => {
  const {
    fields: variations,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'variations',
  });
  return (
    <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2 " height="fit-content">
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader
          title="Spelling Variations"
          tooltip={`Unlike dialects, spelling variations capture the
          variations in spelling within Standard Igbo.`}
        />
        <Button
          variant="primary"
          aria-label="Add Variation"
          onClick={() => append({ text: '' })}
          leftIcon={<AddIcon />}
        >
          Add Variation
        </Button>
      </Box>
      {variations.length ? (
        variations.map(({ text, id }, index) => (
          <Box className="list-container" key={id}>
            <Controller
              render={({ field: props }) => <Input {...props} data-test={`variation-${index}-input`} />}
              name={`variations[${index}].text`}
              control={control}
              defaultValue={text}
            />
            <IconButton
              colorScheme="red"
              aria-label="Delete Variation"
              icon={<DeleteIcon />}
              onClick={() => remove(index)}
              className="ml-3"
            />
          </Box>
        ))
      ) : (
        <Box className="flex w-full justify-center">
          <p className="text-gray-600 mb-4 italic">No spelling variations</p>
        </Box>
      )}
    </Box>
  );
};

export default VariationsForm;
