import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Control, Controller } from 'react-hook-form';
import { Box, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Textarea } from 'src/shared/primitives';
import AddSection from './AddSection';

const EnglishDefinitions = ({
  definitions,
  groupIndex,
  control,
  handleDeleteGroupDefinition,
  handleAddGroupDefinition,
}: {
  definitions: { id: string; text: string }[];
  groupIndex: number;
  control: Control;
  handleDeleteGroupDefinition: (index: number) => void;
  handleAddGroupDefinition: () => void;
}): ReactElement => (
  <Box className="w-full">
    {definitions.map((nestedDefinition, nestedDefinitionIndex) => (
      <Box key={nestedDefinition}>
        <Box className="list-container">
          <h3 className="text-xl text-gray-600 mr-2">{`${nestedDefinitionIndex + 1}.`}</h3>
          <Controller
            render={({ field: props }) => (
              <Textarea
                {...props}
                rows={3}
                className="form-textarea"
                placeholder="Definition in English"
                data-test={`nested-definitions-definitions[${groupIndex}].definitions[${nestedDefinitionIndex}]`}
              />
            )}
            name={`definitions.${groupIndex}.definitions.${nestedDefinitionIndex}.text`}
            defaultValue={get(nestedDefinition, 'text') || ''}
            control={control}
            rules={{
              required: !groupIndex,
            }}
          />
          {nestedDefinitionIndex ? (
            <IconButton
              colorScheme="red"
              onClick={() => handleDeleteGroupDefinition(nestedDefinitionIndex)}
              data-test={`delete-button-definitions[${groupIndex}].definitions[${nestedDefinitionIndex}]`}
              className="ml-3"
              aria-label="Delete"
              icon={<DeleteIcon />}
            />
          ) : null}
        </Box>
      </Box>
    ))}
    <AddSection label="Add English Definition" onClick={handleAddGroupDefinition} />
  </Box>
);

export default EnglishDefinitions;
