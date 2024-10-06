import React, { ReactElement } from 'react';
import { Box, Button, Tooltip } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useFieldArray } from 'react-hook-form';
import { DefinitionSchema } from 'src/backend/controllers/utils/interfaces';
import FormHeader from '../../../FormHeader';
import DefinitionsFormInterface from './DefinitionsFormInterface';
import DefinitionForm from './DefinitionForm';

const DefinitionsForm = ({ errors, control, getValues, record }: DefinitionsFormInterface): ReactElement => {
  const {
    fields: definitions,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'definitions',
  });
  const handleAddDefinitionGroup = () => {
    append({
      wordClass: null,
      definitions: [],
      igboDefinitions: [],
      nsibidi: '',
      nsibidiCharacters: [],
    } as DefinitionSchema);
  };

  const handleDeleteDefinitionGroup = (groupIndex) => {
    remove(groupIndex);
  };

  return (
    <Box className="w-full space-y-4">
      <Box className="flex items-start mt-12 w-full justify-between">
        <FormHeader
          title={`Definition Groups (${definitions.length})`}
          tooltip="Definition Groups are groups of definitions that apply to a
             specific part of speech for the headword"
        />
        <Button
          variant="primary"
          aria-label="Add Definition Group"
          onClick={handleAddDefinitionGroup}
          leftIcon={<AddIcon />}
        >
          Add Definition Group
        </Button>
      </Box>
      <Box className="w-full grid grid-flow-row grid-cols-1 gap-4 px-3">
        {definitions.map(({ id }, index) => (
          <Box borderBottomWidth="1px" borderBottomColor="gray.300" mb={4} key={`definitions-${id}`}>
            {definitions.length > 1 ? (
              <Tooltip label="Delete Definition Group">
                <Button
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<DeleteIcon color="red" />}
                  padding={0}
                  onClick={() => handleDeleteDefinitionGroup(index)}
                  _hover={{
                    background: 'transparent',
                  }}
                  _active={{
                    background: 'transparent',
                  }}
                >
                  Delete Definition Group
                </Button>
              </Tooltip>
            ) : null}
            <DefinitionForm
              errors={errors}
              control={control}
              groupIndex={index}
              record={record}
              getValues={getValues}
            />
            {(errors.definitions || [])[index] ? <p className="error relative">Definition is required</p> : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
export default DefinitionsForm;
