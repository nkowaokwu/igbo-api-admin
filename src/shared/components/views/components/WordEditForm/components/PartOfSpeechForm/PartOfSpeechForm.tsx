import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import WordClass from '../../../../../../constants/WordClass';
import FormHeader from '../../../FormHeader';
import PartOfSpeechFormInterface from './PartOfSpeechFormInterface';

const PartOfSpeechForm = ({
  errors,
  control,
  getValues,
  cacheForm,
  options,
  record,
}: PartOfSpeechFormInterface): ReactElement => {
  /* Finds the default value for the wordClass field */
  const determineDefaultWordClassValue = () => {
    const isRecordWordClassTagSet = !!WordClass[record.wordClass];
    const isGetValuesWordClassTagSet = !!WordClass[getValues().wordClass];

    const fallbackWordClassLabel = isRecordWordClassTagSet
      ? WordClass[record.wordClass].label
      : isGetValuesWordClassTagSet
        ? WordClass[getValues().wordClass].label
        : record.wordClass || getValues().wordClass;
    const fallbackWordClassValue = isRecordWordClassTagSet
      ? WordClass[record.wordClass].value
      : isGetValuesWordClassTagSet
        ? WordClass[getValues().wordClass].value
        : record.wordClass || getValues().wordClass;
    return (
      record.wordClass?.label
        ? record.wordClass
        : {
          label: fallbackWordClassLabel,
          value: fallbackWordClassValue,
        }
    );
  };

  return (
    <Box className="flex flex-col w-full">
      <FormHeader
        title="Part of Speech"
        tooltip="If you would like to add a new Part of Speech, reach out to #translators."
      />
      <Box data-test="word-class-input-container">
        <Controller
          render={({ onChange, ...rest }) => (
            <Select
              {...rest}
              onChange={(e) => {
                onChange(e);
                cacheForm();
              }}
              options={options}
            />
          )}
          name="wordClass"
          control={control}
          defaultValue={determineDefaultWordClassValue()}
        />
      </Box>
      {errors.wordClass && (
        <span className="error">Part of speech is required</span>
      )}
    </Box>
  );
};

export default PartOfSpeechForm;
