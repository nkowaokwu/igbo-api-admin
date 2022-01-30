import React, { ReactElement, useEffect } from 'react';
import { Record } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import { Box, Button, useToast } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { DEFAULT_RECORD } from '../../../../../../constants';
import { Word } from '../../../../../../../backend/controllers/utils/interfaces';
import FormHeader from '../../../FormHeader';
import useRecorder from '../../../../../../../hooks/useRecorder';

const AudioRecorder = ({
  path,
  getFormValues,
  setPronunciation,
  record,
  originalRecord: originalRecordProp,
}: {
  path: string,
  getFormValues: (key: string) => any,
  setPronunciation: (key: string, value: any) => any,
  record: Record | Word,
  originalRecord: Record,
}): ReactElement => {
  const originalRecord = record.originalWordId
    ? originalRecordProp
    : DEFAULT_RECORD;
  const pathLabel = path === 'headword' ? 'Standard Igbo' : path;
  const pronunciationPath = getFormValues(path === 'headword' ? 'pronunciation' : `dialects.${path}.pronunciation`);
  const [audioBlob, isRecording, startRecording, stopRecording] = useRecorder();
  const toast = useToast();

  /* Resets the audio pronunciation to its original value */
  const resetRecording = () => {
    const pronunciationPath = path === 'headword' ? 'pronunciation' : `dialects.${path}.pronunciation`;
    const originalPronunciationValue = path === 'headword'
      ? originalRecord.pronunciation
      : originalRecord[`${pronunciationPath}`];
    setPronunciation(pronunciationPath, originalPronunciationValue);
    toast({
      title: 'Reset Audio Pronunciation',
      description: 'The audio pronunciation for this slot has been reset to its original value',
      status: 'info',
      duration: 9000,
      isClosable: true,
    });
  };

  const shouldRenderNewPronunciationLabel = () => {
    const currentPronunciationPath = getFormValues(path === 'headword'
      ? 'pronunciation'
      : `dialects.${path}.pronunciation`);
    return currentPronunciationPath && currentPronunciationPath.startsWith('data');
  };

  /* Listen to changes to the audioBlob for the current pronunciation and saves it */
  useEffect(() => {
    const base64data = audioBlob;
    setPronunciation(path === 'headword' ? 'pronunciation' : `dialects.${path}.pronunciation`, base64data);
    if (base64data) {
      toast({
        title: 'Recorded new audio',
        description: `A new audio pronunciation for 
        ${pathLabel} has been recorded`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [audioBlob]);

  return (
    <Box className="flex flex-col w-full">
      <FormHeader
        title="Word Pronunciation"
        tooltip="Record the audio for the headword only one time. You are able to record over pre-existing recordings"
      />
      <Box data-test="word-pronunciation-input-container">
        <Box className="flex flex-col justify-center items-center w-full lg:space-x-4">
          {!isRecording ? (
            <Box className="flex flex-row justify-center w-full lg:space-x-4 space-x-3">
              <Button
                borderRadius="full"
                height="40px"
                width="40px"
                data-test={`start-recording-button${path === 'headword' ? '' : `-${path}`}`}
                className="flex justify-center items-center"
                colorScheme="red"
                onClick={startRecording}
              >
                <Box height="8px" width="8px" borderRadius="full" backgroundColor="white" />
              </Button>

              <Button
                leftIcon={<DeleteIcon />}
                data-test={`reset-recording-button${path === 'headword' ? '' : `-${path}`}`}
                colorScheme="gray"
                onClick={resetRecording}
              >
                Reset Recording
              </Button>
            </Box>
          ) : (
            <Box>
              <canvas id="canvas" height={100} width={150} />
              <Button
                data-test={`stop-recording-button${path === 'headword' ? '' : `-${path}`}`}
                onClick={stopRecording}
                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-400 w-full"
                type="button"
                colorScheme="green"
              >
                Stop Recording
              </Button>
            </Box>
          )}
        </Box>
        <Box className="mt-3 text-center flex flex-row justify-center">
          {pronunciationPath ? (
            <Box className="flex flex-col">
              <ReactAudioPlayer
                data-test={`${path}-audio-playback`}
                style={{ height: 40, width: 250 }}
                id="audio"
                src={pronunciationPath}
                controls
              />
              {shouldRenderNewPronunciationLabel() && (
                <span className="text-green-500 mt-2">New pronunciation recorded</span>
              )}
            </Box>
          ) : <span className="text-gray-700 italic">No audio pronunciation</span>}
        </Box>
      </Box>
    </Box>
  );
};

export default AudioRecorder;
