import React, { ReactElement } from 'react';
import { get, values } from 'lodash';
import { Box } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import WordClass from 'src/backend/shared/constants/WordClass';
import { PARTS_OF_SPEECH_LIST } from 'src/Core/constants';
import FormHeader from '../../../FormHeader';
import PartOfSpeechFormInterface from './PartOfSpeechFormInterface';

const PartOfSpeechForm = ({ errors, control, groupIndex }: PartOfSpeechFormInterface): ReactElement => {
  const { getValues } = control;
  const options = values(WordClass);

  return (
    <Box className="flex flex-col w-full">
      <FormHeader
        title="Part of Speech"
        tooltip="If you would like to add a new Part of Speech, reach out to #translators."
        href={PARTS_OF_SPEECH_LIST}
      />
      <Box data-test="word-class-input-container">
        <Controller
          render={(props) => <Select {...props} options={options} />}
          name={`definitions[${groupIndex}].wordClass`}
          defaultValue={get(getValues(), `definitions[${groupIndex}].wordClass`)}
          control={control}
        />
      </Box>
      {errors.wordClass ? <p className="error">Part of speech is required</p> : null}
    </Box>
  );
};

export default PartOfSpeechForm;
