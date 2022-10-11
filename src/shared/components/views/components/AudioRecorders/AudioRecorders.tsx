import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { Box, Button, Tooltip } from '@chakra-ui/react';
import { Control, Controller } from 'react-hook-form';
import { Example, Word } from 'src/backend/controllers/utils/interfaces';
import AudioRecorder from './AudioRecorder';
import FormHeader from '../FormHeader';

const AudioRecorders = ({
  path,
  record,
  originalRecord,
  pronunciations,
  setPronunciations,
  getValues,
  setValue,
  control,
  formTitle,
  formTooltip,
  name,
} : {
  path: string,
  record: Record | Example | Word,
  originalRecord: Record | Example | Word,
  pronunciations: string[],
  setPronunciations: React.Dispatch<React.SetStateAction<string[]>>,
  getValues: (key: string) => any,
  setValue: (key: string, value: any) => void,
  control: Control,
  formTitle?: string,
  formTooltip?: string,
  name: string,
}): ReactElement => (
  <>
    <FormHeader
      title={formTitle}
      tooltip={formTooltip}
    />
    <Tooltip label="Add another recording for this headword">
      <Button
        onClick={() => {
          setPronunciations([...pronunciations, '']);
        }}
      >
        Add recording
      </Button>
    </Tooltip>
    <Controller
      render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
      name="pronunciation"
      control={control}
      defaultValue={[]}
    />
    {pronunciations.map((pronunciation, index) => (
      <Box className="flex flex-row justify-between items-center">
        <Controller
          render={() => (
            <AudioRecorder
              path={path}
              index={index}
              getFormValues={getValues}
              setPronunciation={setValue}
              removePronunciation={() => {
                setPronunciations((prevPronunciations) => {
                  const updatedPronunciations = [...prevPronunciations];
                  updatedPronunciations.splice(index, 1);
                  setValue('pronunciation', []);
                  return [];
                });
              }}
              record={record}
              originalRecord={originalRecord}
            />
          )}
          defaultValue={pronunciation}
          name={name.replace('index', `${index}`)}
          control={control}
        />
      </Box>
    ))}
  </>
);

AudioRecorders.defaultProps = {
  formTitle: 'Audio Pronunciations',
  formTooltip: `Record the audio for the headword once per recording. 
  You are able to record multiple audio clips for the same headword.`,
};

export default AudioRecorders;
