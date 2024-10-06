import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Record } from 'react-admin';
import { Box } from '@chakra-ui/react';
import { Control, useFieldArray, UseFormGetValues } from 'react-hook-form';
import FormHeader from '../../../FormHeader';
import NsibidiForm from '../NsibidiForm';
import PartOfSpeechForm from '../PartOfSpeechForm';
import EnglishDefinitions from './EnglishDefinitions';
import IgboDefinitions from './IgboDefinitions';

const DefinitionForm = ({
  errors,
  control,
  getValues,
  groupIndex,
  record,
}: {
  errors: any;
  control: Control;
  getValues: UseFormGetValues<any>;
  groupIndex: number;
  record: Record;
}): ReactElement => {
  const {
    fields: definitions,
    append: appendDefinition,
    remove: removeDefinition,
  } = useFieldArray({
    control,
    name: `definitions.${groupIndex}.definitions`,
  });
  const {
    fields: igboDefinitions,
    append: appendIgboDefinition,
    remove: removeIgboDefinition,
  } = useFieldArray({
    control,
    name: `definitions.${groupIndex}.igboDefinitions`,
  });
  const handleAddGroupDefinition = () => {
    appendDefinition({ text: '' });
  };
  const handleAddGroupIgboDefinition = () => {
    appendIgboDefinition({ igbo: '', nsibidi: '', nsibidiCharacters: [] });
  };
  const handleDeleteGroupDefinition = (nestedDefinitionIndex) => {
    removeDefinition(nestedDefinitionIndex);
  };
  const handleDeleteGroupIgboDefinition = (nestedDefinitionIndex) => {
    removeIgboDefinition(nestedDefinitionIndex);
  };
  return (
    <>
      <Box className="flex flex-col lg:flex-row lg:space-x-3 items-start">
        <PartOfSpeechForm errors={errors} control={control} groupIndex={groupIndex} record={record} />
        <NsibidiForm
          control={control}
          getValues={getValues}
          name={`definitions[${groupIndex}].nsibidi`}
          errors={errors}
          defaultValue={get(record, `definitions[${groupIndex}].nsibidi`)}
        />
      </Box>
      <Box className="flex flex-row items-center my-5 w-full justify-between">
        <FormHeader
          title="Definitions"
          tooltip="Separate definitions if each are vastly different in
          contextual meaning. Igbo definitions are written in Igbo."
        />
      </Box>
      <Box className="flex flex-col lg:flex-row justify-center items-start w-full lg:space-x-12">
        <EnglishDefinitions
          definitions={definitions}
          groupIndex={groupIndex}
          control={control}
          handleDeleteGroupDefinition={handleDeleteGroupDefinition}
          handleAddGroupDefinition={handleAddGroupDefinition}
        />
        <IgboDefinitions
          definitions={igboDefinitions}
          groupIndex={groupIndex}
          control={control}
          handleDeleteGroupIgboDefinition={handleDeleteGroupIgboDefinition}
          handleAddGroupIgboDefinition={handleAddGroupIgboDefinition}
          errors={errors}
          getValues={getValues}
        />
      </Box>
    </>
  );
};

export default DefinitionForm;
