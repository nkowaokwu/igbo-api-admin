import React, { useState, ReactElement } from 'react';
import { Record } from 'react-admin';
import { Box, Tag } from '@chakra-ui/react';

const AudioRecordingPreview = (
  { record }:
  { record: { pronunciation: string } | Record },
): ReactElement => {
  const audio = new Audio(record.pronunciation);
  const [isAudioAvailable, setIsAudioAvailable] = useState(false);

  audio.addEventListener('canplay', () => {
    setIsAudioAvailable(true);
  });

  const playAudio = () => {
    audio.play();
  };
  return (
    <Box data-test="pronunciation-cell">
      {record.pronunciation ? (
        <Tag
          colorScheme={!isAudioAvailable ? 'yellow' : 'green'}
          className="text-center cursor-pointer"
          onClick={playAudio}
          type="button"
        >
          {!isAudioAvailable ? 'Rerecord audio' : '🎙 Play'}
        </Tag>
      ) : (
        <Tag colorScheme="red" className="text-center">No Recording</Tag>
      )}
    </Box>
  );
};

export default AudioRecordingPreview;
