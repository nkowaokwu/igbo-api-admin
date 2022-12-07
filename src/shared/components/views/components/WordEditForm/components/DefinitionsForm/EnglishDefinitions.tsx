import React, { ReactElement } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Box, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Textarea } from 'src/shared/primitives';
import { DefinitionSchema } from 'src/backend/controllers/utils/interfaces';
import AddSection from './AddSection';

const EnglishDefinitions = ({
  nestedDefinitions,
  index,
  control,
  handleDeleteGroupDefinition,
  handleAddGroupDefinition,
} : {
  nestedDefinitions: DefinitionSchema['definitions'],
  index: number,
  control: Control,
  handleDeleteGroupDefinition: (value: number, secondValue: number) => void,
  handleAddGroupDefinition: (value: number) => void,
}): ReactElement => (
  <Box className="w-full">
    {nestedDefinitions.map((nestedDefinition, nestedDefinitionIndex) => (
      <Box key={nestedDefinition}>
        <Box className="list-container">
          <h3 className="text-xl text-gray-600 mr-2">
            {`${nestedDefinitionIndex + 1}.`}
          </h3>
          <Controller
            render={(props) => (
              <Textarea
                {...props}
                rows={1}
                className="form-textarea"
                placeholder="Definition in English"
                data-test={`nested-definitions-${nestedDefinitionIndex}-input`}
              />
            )}
            name={`definitions[${index}].definitions[${nestedDefinitionIndex}]`}
            defaultValue={nestedDefinition}
            control={control}
            rules={{
              required: !index,
            }}
          />
          {nestedDefinitionIndex ? (
            <IconButton
              colorScheme="red"
              onClick={() => handleDeleteGroupDefinition(index, nestedDefinitionIndex)}
              className="ml-3"
              aria-label="Delete"
              icon={<DeleteIcon />}
            />
          ) : null }
        </Box>
      </Box>
    ))}
    <AddSection
      label="Add English Definition"
      onClick={() => handleAddGroupDefinition(index)}
    />
  </Box>
);

export default EnglishDefinitions;
