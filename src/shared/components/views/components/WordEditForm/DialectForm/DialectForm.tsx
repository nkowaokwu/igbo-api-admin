import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';
import { Input } from '../../../../../primitives';
import DialectFormInterface from './DialectFormInterface';
import AudioRecorder from '../components/AudioRecorder';

const DialectForm = ({
  dialect,
  dialectLabel,
  formData,
  record,
  control,
  getValues,
  setValue,
  updateSelectedDialects,
  originalRecord,
}: DialectFormInterface) : ReactElement => (
  <Box
    className="my-3 bg-gray-200 rounded p-3"
    key={`dialects.${dialect}.word`}
  >
    <h3 className="text-lg font-bold">{dialectLabel}</h3>
    <h4 className="text-gray-700">Word:</h4>
    <Controller
      render={(props) => (
        <Input
          {...props}
          className="form-input"
          placeholder={`Word in ${dialectLabel} dialect`}
          data-test={`dialects-${dialect}-word-input`}
        />
      )}
      name={`dialects.${dialect}.word`}
      defaultValue={record.dialects[dialect].word
        || (formData.dialects && formData.dialects[dialect].word)
        || ''}
      control={control}
    />
    <Controller
      render={() => (
        <AudioRecorder
          path={dialect}
          getFormValues={getValues}
          setPronunciation={setValue}
          updateSelectedDialects={updateSelectedDialects}
          record={record}
          originalRecord={originalRecord}
        />
      )}
      name={`dialects.${dialect}.pronunciation`}
      defaultValue={record.dialects[dialect].pronunciation
        || (formData.dialects && formData.dialects[dialect]?.pronunciation)
        || null}
      control={control}
    />
  </Box>
);

export default DialectForm;
