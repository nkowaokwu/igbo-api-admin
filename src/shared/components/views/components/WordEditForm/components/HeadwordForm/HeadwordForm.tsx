import React, { ReactElement } from 'react';
import { Box, Checkbox } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import { Input } from '../../../../../../primitives';
import FormHeader from '../../../FormHeader';
import HeadwordInterface from './HeadwordFormInterface';

const HeadwordForm = ({
  errors,
  control,
  record,
  getValues,
}: HeadwordInterface): ReactElement => (
  <Box className="flex flex-col w-full">
    <Box className="flex justify-between items-between">
      <FormHeader
        title="Headword"
        tooltip={`This is the headword that should ideally be in to Standard Igbo.
        Add diacritic marks to denote the tone for the word. 
        All necessary accented characters will appear in the letter popup`}
      />
      <Controller
        render={({ onChange, value, ref }) => (
          <Checkbox
            onChange={(e) => onChange(e.target.checked)}
            isChecked={value}
            defaultIsChecked={record.isStandardIgbo}
            ref={ref}
            data-test="isStandardIgbo-checkbox"
            size="lg"
          >
            <span className="font-bold">Is Standard Igbo</span>
          </Checkbox>
        )}
        defaultValue={record.isStandardIgbo || getValues().isStandardIgbo}
        name="isStandardIgbo"
        control={control}
      />
    </Box>
    <Controller
      render={(props) => (
        <Input
          {...props}
          className="form-input"
          placeholder="i.e. biko, igwe, mmiri"
          data-test="word-input"
        />
      )}
      name="word"
      control={control}
      defaultValue={record.word || getValues().word}
    />
    {errors.word && (
      <span className="error">Word is required</span>
    )}
  </Box>
);

export default HeadwordForm;
