import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { Box, IconButton, Tooltip } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Example } from 'src/backend/controllers/utils/interfaces';
import AudioRecorder from './views/components/AudioRecorder';

const ExamplePronunciation = ({
  pronunciation,
  index,
  onOpenAlert,
  setPronunciation,
  example,
  originalRecord,
} : {
  pronunciation: { audio: string, speaker: string },
  index: number,
  onOpenAlert: (index) => void,
  setPronunciation: (path: string, data: string) => void,
  example: Example,
  originalRecord: Record,
}): ReactElement => (
  <Box key={pronunciation.audio} position="relative">
    <Tooltip
      label="This will delete the current sentence audio recording for the example sentence.
      This will not delete the example sentence."
    >
      <IconButton
        position="absolute"
        top="20px"
        right="0"
        variant="ghost"
        colorScheme="red"
        icon={<DeleteIcon />}
        onClick={() => onOpenAlert(index)}
        aria-label="Delete sentence recording button"
      />
    </Tooltip>
    <AudioRecorder
      key={pronunciation.audio}
      path={`pronunciations.${index}`}
      getFormValues={() => pronunciation}
      setPronunciation={setPronunciation}
      record={example}
      originalRecord={originalRecord}
      formTitle="Igbo Sentence Recording"
      formTooltip="Record the audio for the Igbo example sentence only one time.
      You are able to record over pre-existing recordings."
      index={index}
    />
  </Box>
);

export default ExamplePronunciation;
