import React, { ReactElement } from 'react';
import { Control, Controller, UseFormGetValues } from 'react-hook-form';
import { Box, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Textarea } from 'src/shared/primitives';
import AddSection from './AddSection';
import NsibidiForm from '../NsibidiForm';

const IgboDefinitions = ({
  definitions,
  groupIndex,
  control,
  getValues,
  errors,
  handleDeleteGroupIgboDefinition,
  handleAddGroupIgboDefinition,
}: {
  definitions: { id: string; igbo: string; nsibidi: string; nsibidiCharacters: [] }[];
  groupIndex: number;
  control: Control;
  getValues: UseFormGetValues<any>;
  handleDeleteGroupIgboDefinition: (index: number) => void;
  handleAddGroupIgboDefinition: () => void;
  errors: any;
}): ReactElement => (
  <Box className="w-full">
    {definitions.map((igboDefinition, igboDefinitionIndex) => (
      <Box key={igboDefinition?.id} data-igbo-definition={igboDefinition?.id}>
        <Box className="list-container">
          <h3 className="text-xl text-gray-600 mr-2">{`${igboDefinitionIndex + 1}.`}</h3>
          <Box className="flex flex-col space-y-2 w-full">
            <Controller
              render={({ field: props }) => (
                <Textarea
                  {...props}
                  rows={3}
                  className="form-textarea"
                  placeholder="Definition in Igbo"
                  // eslint-disable-next-line max-len
                  data-test={`nested-definitions-definitions[${groupIndex}].igboDefinitions[${igboDefinitionIndex}].igbo`}
                />
              )}
              name={`definitions.${groupIndex}.igboDefinitions.${igboDefinitionIndex}.igbo`}
              value={igboDefinition?.igbo || ''}
              control={control}
            />
            <NsibidiForm
              control={control}
              getValues={getValues}
              name={`definitions[${groupIndex}].igboDefinitions[${igboDefinitionIndex}].nsibidi`}
              placeholder="Definition in Nsịbịdị"
              data-test={`nested-definitions-nsibidi-${igboDefinitionIndex}-input`}
              errors={errors}
            />
          </Box>
          <IconButton
            colorScheme="red"
            onClick={() => handleDeleteGroupIgboDefinition(igboDefinitionIndex)}
            data-test={`delete-button-definitions[${groupIndex}].igboDefinitions[${igboDefinitionIndex}]`}
            className="ml-3"
            aria-label="Delete"
            icon={<DeleteIcon />}
          />
        </Box>
      </Box>
    ))}
    <AddSection label="Add Igbo Definition" onClick={handleAddGroupIgboDefinition} />
  </Box>
);
export default IgboDefinitions;
