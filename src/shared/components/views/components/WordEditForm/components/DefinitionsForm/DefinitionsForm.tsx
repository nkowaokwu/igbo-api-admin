import React, { ReactElement } from 'react';
import { Controller } from 'react-hook-form';
import { Box, Button, Tooltip } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Textarea } from 'src/shared/primitives';
import FormHeader from '../../../FormHeader';
import DefinitionsFormInterface from './DefinitionsFormInterface';
import PartOfSpeechForm from '../PartOfSpeechForm';

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
  const handleDeleteGroupDefinition = (groupIndex, nestedDefinitionIndex) => {
    const updateDefinitions = [...definitions];
    updateDefinitions[groupIndex].definitions.splice(nestedDefinitionIndex, 1);
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
      <Box className={`w-full grid grid-flow-row grid-cols-1
        ${definitions.length > 1 ? 'lg:grid-cols-2' : ''} gap-4 px-3`}
      >
        {definitions.map(({ definitions: nestedDefinitions, _id }, index) => (
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
                  onClick={() => handleDeleteDefinitionGroup(index)}
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
                tooltip="Separate definitions if each are vastly different in contextual meaning"
              />
            </Box>
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
                        rows={3}
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
                  {index ? (
                    <Button
                      colorScheme="red"
                      onClick={() => handleDeleteGroupDefinition(index, nestedDefinitionIndex)}
                      className="ml-3"
                      leftIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  ) : null }
                </Box>
              </Box>
            ))}
            <Box className="flex justify-center items-center bg-gray-200 py-6 px-4rounded mb-4">
              <Button
                colorScheme="green"
                aria-label="Add Definition"
                onClick={() => handleAddGroupDefinition(index)}
                leftIcon={<AddIcon />}
              >
                Add Definition
              </Button>
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
