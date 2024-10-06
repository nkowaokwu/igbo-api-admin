import React, { ReactElement } from 'react';
import { get, values } from 'lodash';
import { Box } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import WordClass from 'src/backend/shared/constants/WordClass';
import { PARTS_OF_SPEECH_LIST } from 'src/Core/constants';
import FormHeader from '../../../FormHeader';
import PartOfSpeechFormInterface from './PartOfSpeechFormInterface';

const PartOfSpeechForm = ({ errors, control, groupIndex, record }: PartOfSpeechFormInterface): ReactElement => {
  const options = values(WordClass).map(({ value, label }) => ({ value, label }));
  const defaultValue = {
    label: WordClass[get(record, `definitions[${groupIndex}].wordClass`)]?.label || 'No selected part of speech',
    value: get(record, `definitions[${groupIndex}].wordClass`),
  };

  return (
    <Box className="flex flex-col w-full">
      <FormHeader
        title="Part of Speech"
        tooltip="If you would like to add a new Part of Speech, reach out to #translators."
        href={PARTS_OF_SPEECH_LIST}
      />
      <Box data-test="word-class-input-container">
        <Controller
          render={({ field: props }) => <Select {...props} options={options} />}
          name={`definitions[${groupIndex}].wordClass`}
          defaultValue={defaultValue}
          control={control}
        />
      </Box>
      {errors.wordClass ? <p className="error">Part of speech is required</p> : null}
    </Box>
  );
};

export default PartOfSpeechForm;
