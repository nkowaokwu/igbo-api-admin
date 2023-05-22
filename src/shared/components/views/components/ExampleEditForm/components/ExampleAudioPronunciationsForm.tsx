import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box, Text } from '@chakra-ui/react';
import { Record } from 'react-admin';
import { Controller, Control, useFieldArray } from 'react-hook-form';
import AddAudioPronunciationButton from './AddAudioPronunciationButton';
import FormHeader from '../../FormHeader';
import AudioRecorder from '../../AudioRecorder';

const ExampleAudioPronunciationsForm = ({
  control,
  record,
  originalRecord,
  uid,
} : {
  control: Control,
  record: Record,
  originalRecord: Record | null,
  uid: string,
}): ReactElement => {
  const { fields: pronunciations, append } = useFieldArray({
    control,
    name: 'pronunciations',
  });
  const { getValues, setValue } = control;

  return (
    <>
      <FormHeader
        title="Igbo Sentence Recordings"
        tooltip="An example can have multiple audio recorded for it. One on unique
        speaker can record a version for this sentence."
      />
      {pronunciations?.length ? pronunciations.map((pronunciation, index) => (
        <>
          <Controller
            render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
            name={`pronunciations.${index}.audio`}
            control={control}
            defaultValue={pronunciation.audio}
          />
          <Controller
            render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
            name={`pronunciations.${index}.speaker`}
            control={control}
            defaultValue={pronunciation.speaker}
          />
          <AudioRecorder
            path="pronunciations.0.audio"
            getFormValues={() => get(getValues(), 'pronunciations.0.audio')}
            setPronunciation={(_, value) => {
              setValue('pronunciations.0.audio', value);
              setValue('pronunciations.0.speaker', uid);
            }}
            record={record}
            originalRecord={originalRecord}
            formTitle=""
            formTooltip=""
          />
        </>
      )) : (
        <Box className="flex w-full justify-center mb-2">
          <Text className="italic text-gray-700" fontFamily="Silka">No audio pronunciations</Text>
        </Box>
      )}
      <AddAudioPronunciationButton append={append} />
    </>
  );
};

export default ExampleAudioPronunciationsForm;
