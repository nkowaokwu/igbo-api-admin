import React, { ReactElement } from 'react';
import {
  Box,
  Heading,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import Select from 'react-select';
import { Controller } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import Dialects from 'src/backend/shared/constants/Dialects';
import DialectFormInterface from './DialectFormInterface';
import AudioRecorder from '../../AudioRecorder';

const DialectForm = ({
  index,
  record,
  control,
  getValues,
  setValue,
  setDialects,
  dialects,
  originalRecord,
}: DialectFormInterface) : ReactElement => {
  const dialect = dialects[index];
  const defaultDialectsValue = (dialect.dialects || []).map((value) => (
    { label: Dialects[value].label, value }
  ));

  return (
    <Box
      className="mb-4 bg-gray-200 rounded p-3"
      key={`dialects.${dialect.id}.word`}
    >
      <Box className="flex flex-col justify-center items-center space-y-3 lg:space-y-0 space-x-3">
        <Box flex={3} className="w-full">
          <Box className="flex flex-row justify-between items-center" mb={3}>
            <Heading as="h3" m={0} fontSize="xl" fontWeight="normal">Word</Heading>
            <Tooltip label="Delete dialectal variation">
              <IconButton
                colorScheme="red"
                icon={<DeleteIcon />}
                onClick={() => {
                  const updatedDialects = [...dialects];
                  updatedDialects.splice(index, 1);
                  setDialects(updatedDialects);
                }}
                aria-label="Delete dialectal variation"
              />
            </Tooltip>
          </Box>
          <Controller
            render={({ onChange }) => (
              <Input
                onChange={onChange}
                className="form-input"
                placeholder="Dialectal variation"
                data-test={`dialects-${index}-word-input`}
                defaultValue={dialect.word || ''}
              />
            )}
            name={`dialects.${index}.word`}
            defaultValue={dialect?.word}
            control={control}
          />
        </Box>
        <Box flex={2} className="w-full">
          <Controller
            render={() => (
              <AudioRecorder
                path={`dialects.${index}`}
                getFormValues={getValues}
                setPronunciation={(path, value) => {
                  const updatedDialects = [...dialects];
                  updatedDialects[index].pronunciation = value;
                  setDialects(updatedDialects);
                  /**
                   * We are calling React Hook Form's setValue to update the current dialect's pronunciation.
                   * This step is necessary so we can have access to the latest updated pronunciation
                   * when preparing our payload to send to the backend.
                   */
                  setValue(path, value);
                }}
                record={record}
                originalRecord={originalRecord}
              />
            )}
            name={`dialects.${index}.pronunciation`}
            defaultValue={dialect.pronunciation}
            control={control}
          />
        </Box>
      </Box>
      <Box className="mt-4">
        <Heading as="h3" style={{ flex: 1 }} fontSize="xl" fontWeight="normal" mb={3}>Dialects</Heading>
        <Box flex={1}>
          <Controller
            render={({ onChange }) => (
              <Select
                isMulti
                options={Object.values(Dialects)}
                placeholder="Select associated dialects"
                onChange={(e) => {
                  const values = e || [];
                  const updatedNestedDialects = values.map(({ value }) => value);
                  const updatedDialects = [...dialects];
                  updatedDialects[index].dialects = updatedNestedDialects;
                  onChange(updatedNestedDialects);
                  setDialects(updatedDialects);
                }}
                defaultValue={defaultDialectsValue}
              />
            )}
            name={`dialects.${index}.dialects`}
            defaultValue={defaultDialectsValue}
            control={control}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DialectForm;
