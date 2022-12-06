import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import WordClass from 'src/shared/constants/WordClass';
import FormHeader from '../../../FormHeader';
import PartOfSpeechFormInterface from './PartOfSpeechFormInterface';

const PartOfSpeechForm = ({
  errors,
  control,
  getValues,
  cacheForm,
  options,
  record,
  index,
}: PartOfSpeechFormInterface): ReactElement => {
  /* Finds the default value for the wordClass field */
  const determineDefaultWordClassValue = () => {
    const recordWordClass = get(record, `definitions[${index}].wordClass`);
    const getValuesWordClass = get(getValues(), `definitions[${index}].wordClass`);
    const isRecordWordClassTagSet = !!WordClass[recordWordClass];
    const isGetValuesWordClassTagSet = !!WordClass[getValuesWordClass];

    const fallbackWordClassLabel = isRecordWordClassTagSet
      ? WordClass[recordWordClass].label
      : isGetValuesWordClassTagSet
        ? WordClass[getValuesWordClass].label
        : recordWordClass || getValuesWordClass;
    const fallbackWordClassValue = isRecordWordClassTagSet
      ? WordClass[recordWordClass].value
      : isGetValuesWordClassTagSet
        ? WordClass[getValuesWordClass].value
        : recordWordClass || getValuesWordClass;
    return (
      recordWordClass?.label
        ? recordWordClass
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
          name={`definitions[${index}].wordClass`}
          control={control}
          defaultValue={determineDefaultWordClassValue()}
        />
      </Box>
      {errors.wordClass ? (
        <p className="error">Part of speech is required</p>
      ) : null}
    </Box>
  );
};

export default PartOfSpeechForm;
