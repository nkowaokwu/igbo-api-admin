import React, { ReactElement, useState } from 'react';
import { Box, IconButton, Tooltip } from '@chakra-ui/react';
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
  const [dialectalWord, setDialectalWord] = useState(dialect.word);
  const defaultDialectsValue = (dialect.dialects || []).map((value) => (
    { label: Dialects[value].label, value }
  ));

  return (
    <Box
      className="my-3 bg-gray-200 rounded p-3"
      key={`dialects.${dialect.word}.word`}
    >
      <Box className="flex flex-col justify-center items-center space-y-3 lg:space-y-0 space-x-3">
        <Box flex={3} className="w-full">
          <Box className="flex flex-row justify-between items-center">
            <h3 className="form-header">Word:</h3>
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
          <Input
            onChange={(e) => {
              setDialectalWord(e.target.value);
            }}
            // @ts-ignore
            onBlur={() => {
              const updatedDialects = [...dialects];
              updatedDialects[index].word = dialectalWord;
              setDialects(updatedDialects);
              /**
               * We are calling React Hook Form's setValue to update the current dialect's object.
               * This step is necessary so we can have access to the latest updated dialect in React
               * Hook Form when preparing our payload to send to the backend.
               */
              setValue(`dialects['${dialectalWord}']`, dialect);
            }}
            className="form-input"
            placeholder="Dialectal variation"
            data-test={`dialects-${dialect.word}-word-input`}
            defaultValue={dialect.word || ''}
          />
        </Box>
        <Box flex={2} className="w-full">
          <Controller
            render={() => (
              <AudioRecorder
                path={dialect.word}
                getFormValues={getValues}
                setPronunciation={(path, value) => {
                  const updatedDialects = [...dialects];
                  const pathWithoutDialectsPrefix = path.split('dialects.')[1];
                  updatedDialects[index][pathWithoutDialectsPrefix] = value;
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
            name={`dialects.${dialect.word}.pronunciation`}
            defaultValue={dialect.pronunciation}
            control={control}
          />
        </Box>
      </Box>
      <Box className="mt-4">
        <h3 style={{ flex: 1 }} className="form-header">Dialects:</h3>
        <Box flex={1}>
          <Controller
            render={({ onChange }) => (
              <Select
                isMulti
                options={Object.values(Dialects)}
                placeholder="Select associated dialects"
                onChange={(e) => {
                  const updatedNestedDialects = e.map(({ value }) => value);
                  const updatedDialects = [...dialects];
                  updatedDialects[index].dialects = updatedNestedDialects;
                  onChange(updatedNestedDialects);
                  setDialects(updatedDialects);
                }}
                defaultValue={defaultDialectsValue}
              />
            )}
            name={`dialects.${dialect.word}.dialects`}
            defaultValue={defaultDialectsValue}
            control={control}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DialectForm;
