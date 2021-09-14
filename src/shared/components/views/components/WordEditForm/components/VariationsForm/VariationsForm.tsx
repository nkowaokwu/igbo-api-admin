import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import FormHeader from '../../../FormHeader';
import { Input } from '../../../../../../primitives';
import VariationsFormInterface from './VariationsFormInterface';

const VariationsForm = (
  { variations, setVariations, control }: VariationsFormInterface,
): ReactElement => (
  <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2">
    <Box className="flex items-center my-5 w-full justify-between">
      <FormHeader
        title="Spelling Variations"
        tooltip={`Unlike dialects, spelling variations capture the
        variations in spelling within the same dialect (Standard Igbo).`}
      />
      <Button
        colorScheme="teal"
        aria-label="Add Variation"
        onClick={() => setVariations([...variations, ''])}
        leftIcon={<AddIcon />}
      >
        Add Variation
      </Button>
    </Box>
    {variations.length ? variations.map((variation, index) => (
      <Box className="list-container" key={variation}>
        <Controller
          render={(props) => (
            <Input
              {...props}
              className="form-input"
            />
          )}
          name={`variations[${index}]`}
          control={control}
          defaultValue={variations[index]}
        />
        <Button
          colorScheme="red"
          aria-label="Delete Variation"
          onClick={() => {
            const filteredVariations = [...variations];
            filteredVariations.splice(index, 1);
            setVariations(filteredVariations);
          }}
          className="ml-3"
          leftIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </Box>
    )) : (
      <Box className="flex w-full justify-center">
        <p className="text-gray-600">No spelling variations</p>
      </Box>
    )}
  </Box>
);
export default VariationsForm;
