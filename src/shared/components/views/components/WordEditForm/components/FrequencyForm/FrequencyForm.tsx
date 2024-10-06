import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import FrequencyFormInterface from './FrequencyFormInterface';
import FrequencySlider from './FrequencySlider';
import FormHeader from '../../../FormHeader';

const FrequencyForm = ({ control, record }: FrequencyFormInterface): ReactElement => (
  <Box className="flex flex-col w-full">
    <FormHeader title="Word Frequency" tooltip="A frequently used word is 5, while an infrequently used word is a 1." />
    <Controller
      render={({ field: { onChange } }) => (
        <FrequencySlider onChange={onChange} defaultValue={get(record, 'frequency') || 1} />
      )}
      name="frequency"
      defaultValue={get(record, 'frequency') || 1}
      control={control}
    />
  </Box>
);

export default FrequencyForm;
