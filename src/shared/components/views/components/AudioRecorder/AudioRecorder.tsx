import React, { ReactElement, useEffect, useState } from 'react';
import { has, get } from 'lodash';
import { Record } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import { Box, Button, useToast } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { DEFAULT_EXAMPLE_RECORD, DEFAULT_WORD_RECORD } from 'src/shared/constants';
import { Example, Word } from 'src/backend/controllers/utils/interfaces';
import useRecorder from 'src/hooks/useRecorder';
import FormHeader from '../FormHeader';

const AudioRecorder = ({
  path,
  getFormValues,
  setPronunciation,
  record,
  originalRecord: originalRecordProp,
  formTitle,
  formTooltip,
}: {
  path: string,
  getFormValues: (key: string) => any,
  setPronunciation: (path: string, value: any) => any,
  record: Record | Example | Word,
  originalRecord: Record,
  formTitle?: string,
  formTooltip?: string,
}): ReactElement => {
  const originalRecord = record.originalWordId || record.originalExampleId
    ? originalRecordProp
    : record?.associatedWords
      ? DEFAULT_EXAMPLE_RECORD
      : DEFAULT_WORD_RECORD;
  const pathLabel = path === 'headword'
    ? 'Standard Igbo'
    : path.startsWith('examples') // Handles path for nested examples
      ? 'Example'
      : path;
  const valuePath = path === 'headword'
    ? 'pronunciation'
    : path.startsWith('examples')
      ? 'pronunciation'
      : `dialects.${path}.pronunciation`;
  const formValuePath = path === 'headword'
    ? 'pronunciation'
    : path.startsWith('examples') // Handles path for nested examples
      ? `${path}.pronunciation`
      : `dialects.${path}.pronunciation`;
  const [pronunciationValue, setPronunciationValue] = useState(null);
  const [audioBlob, isRecording, startRecording, stopRecording] = useRecorder();
  const toast = useToast();

  /* Resets the audio pronunciation to its original value */
  const resetRecording = () => {
    const pronunciationPath = valuePath;
    const originalPronunciationValue = path === 'headword'
      ? originalRecord.pronunciation
      : originalRecord[`${pronunciationPath}`];
    setPronunciation(formValuePath, originalPronunciationValue);
    setPronunciationValue(getFormValues(formValuePath));
    toast({
      title: 'Reset Audio Pronunciation',
      description: 'The audio pronunciation for this slot has been reset to its original value',
      status: 'info',
      duration: 9000,
      isClosable: true,
    });
  };

  const shouldRenderNewPronunciationLabel = () => {
    const currentPronunciationPath = getFormValues(valuePath);
    return currentPronunciationPath && currentPronunciationPath.startsWith('data');
  };

  /* Grabbing the default pronunciation value for the word or example document */
  useEffect(() => {
    if (has(record, 'pronunciation') && !pronunciationValue) {
      setPronunciationValue(get(record, valuePath));
    }
  }, [record]);

  /** Listen to changes to the audioBlob for the
   * current pronunciation and saves it. If getFormValues
   * doesn't have a pronunciation key living on the object yet,
   * the platform will not overwrite the pronunciationValue
   * with undefined.
   * */
  useEffect(() => {
    const base64data = audioBlob;
    if (typeof getFormValues(formValuePath) === 'string' && base64data) {
      setPronunciation(formValuePath, base64data);
      setPronunciationValue(getFormValues(formValuePath));
    }
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
        title={formTitle}
        tooltip={formTooltip}
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
          {pronunciationValue ? (
            <Box className="flex flex-col">
              <ReactAudioPlayer
                data-test={`${path}-audio-playback`}
                style={{ height: 40, width: 250 }}
                id="audio"
                src={pronunciationValue}
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

AudioRecorder.defaultProps = {
  formTitle: 'Word Pronunciation',
  formTooltip: 'Record the audio for the headword only one time. You are able to record over pre-existing recordings.',
};

export default AudioRecorder;
