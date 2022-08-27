import React, { useState, ReactElement } from 'react';
import { get } from 'lodash';
import { Record } from 'react-admin';
import { Box, Spinner, Tag } from '@chakra-ui/react';

const AudioRecordingPreview = (
  { record, audioPath = 'pronunciation' }:
  { record: { pronunciation: string } | Record, audioPath?: string },
): ReactElement => {
  const audio = new Audio(record.pronunciation);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioAvailable, setIsAudioAvailable] = useState(false);
  audio.addEventListener('canplay', () => {
    setIsAudioAvailable(true);
    setIsLoading(false);
  });
  audio.addEventListener('error', () => {
    setIsAudioAvailable(false);
    setIsLoading(false);
  });

  const playAudio = () => {
    audio.play();
  };
  return (
    <Box data-test="pronunciation-cell">
      {get(record, audioPath) ? (
        <Tag
          colorScheme={!isAudioAvailable ? 'yellow' : 'green'}
          className="text-center cursor-pointer"
          onClick={playAudio}
        >
          {isLoading ? <Spinner /> : !isAudioAvailable ? 'Rerecord audio' : '🎙 Play'}
        </Tag>
      ) : (
        <Tag colorScheme="red" className="text-center">No Recording</Tag>
      )}
    </Box>
  );
};

AudioRecordingPreview.defaultProps = {
  audioPath: 'pronunciation',
};

export default AudioRecordingPreview;
