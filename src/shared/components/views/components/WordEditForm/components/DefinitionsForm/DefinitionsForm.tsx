import React, { ReactElement } from 'react';
import { Box, Button, Tooltip } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import FormHeader from '../../../FormHeader';
import DefinitionsFormInterface from './DefinitionsFormInterface';
import PartOfSpeechForm from '../PartOfSpeechForm';
import EnglishDefinitions from './EnglishDefinitions';
import IgboDefinitions from './IgboDefinitions';

const DefinitionsForm = ({
  getValues,
  cacheForm,
  options,
  record,
  definitions,
  setDefinitions,
  errors,
  control,
}: DefinitionsFormInterface): ReactElement => {
  const handleAddDefinitionGroup = () => {
    const updateDefinitions = [...definitions];
    // @ts-expect-error _id
    updateDefinitions.push({
      wordClass: '',
      definitions: [],
    });
    setDefinitions(updateDefinitions);
  };
  const handleDeleteDefinitionGroup = (groupIndex) => {
    const updateDefinitions = [...definitions];
    updateDefinitions.splice(groupIndex, 1);
    setDefinitions(updateDefinitions);
  };
  const handleAddGroupDefinition = (groupIndex) => {
    const updateDefinitions = [...definitions];
    updateDefinitions[groupIndex].definitions.push('');
    setDefinitions(updateDefinitions);
  };
  const handleAddGroupIgboDefinition = (groupIndex) => {
    const updateDefinitions = [...definitions];
    updateDefinitions[groupIndex].igboDefinitions.push('');
    setDefinitions(updateDefinitions);
  };
  const handleDeleteGroupDefinition = (groupIndex, nestedDefinitionIndex) => {
    const updateDefinitions = [...definitions];
    updateDefinitions[groupIndex].definitions.splice(nestedDefinitionIndex, 1);
    setDefinitions(updateDefinitions);
  };
  const handleDeleteGroupIgboDefinition = (groupIndex, nestedDefinitionIndex) => {
    const updateDefinitions = [...definitions];
    updateDefinitions[groupIndex].igboDefinitions.splice(nestedDefinitionIndex, 1);
    setDefinitions(updateDefinitions);
  };

  return (
    <Box className="w-full">
      <Box className="flex items-start mt-12 w-full justify-between">
        <Box className="flex flex-col">
          <FormHeader
            title={`Definition Groups (${definitions.length})`}
            tooltip="Definition Groups are groups of definitions that apply to a
             specific part of speech for the headword"
          />
        </Box>
        <Button
          colorScheme="green"
          aria-label="Add Definition Group"
          onClick={handleAddDefinitionGroup}
          leftIcon={<AddIcon />}
        >
          Add Definition Group
        </Button>
      </Box>
      <Box className="w-full grid grid-flow-row grid-cols-1 gap-4 px-3">
        {definitions.map(({ definitions: nestedDefinitions, igboDefinitions = [], _id }, index) => (
          <Box
            borderBottomWidth="1px"
            borderBottomColor="gray.300"
            mb={4}
            key={_id}
          >
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
            <PartOfSpeechForm
              errors={errors}
              control={control}
              getValues={getValues}
              cacheForm={cacheForm}
              options={options}
              record={record}
              index={index}
            />
            <Box className="flex flex-row items-center my-5 w-full justify-between">
              <FormHeader
                title="Definitions"
                tooltip="Separate definitions if each are vastly different in
                contextual meaning. Igbo definitions are written in Igbo."
              />
            </Box>
            <Box className="flex flex-col lg:flex-row justify-center items-center w-full space-x-12">
              <EnglishDefinitions
                nestedDefinitions={nestedDefinitions}
                index={index}
                control={control}
                handleDeleteGroupDefinition={handleDeleteGroupDefinition}
                handleAddGroupDefinition={handleAddGroupDefinition}
              />
              <IgboDefinitions
                igboDefinitions={igboDefinitions}
                index={index}
                control={control}
                handleDeleteGroupIgboDefinition={handleDeleteGroupIgboDefinition}
                handleAddGroupIgboDefinition={handleAddGroupIgboDefinition}
              />
            </Box>
            {(errors.definitions || [])[index] ? (
              <p className="error relative">Definition is required</p>
            ) : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
export default DefinitionsForm;
