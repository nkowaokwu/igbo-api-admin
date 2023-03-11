import React, { ReactElement, useEffect, useState } from 'react';
import { has, get } from 'lodash';
import { Record } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import {
  Box,
  Button,
  IconButton,
  Text,
  Tooltip,
  useToast,
  chakra,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { Example, Word } from 'src/backend/controllers/utils/interfaces';
import useRecorder from 'src/hooks/useRecorder';
import FormHeader from '../FormHeader';

const convertToTime = (seconds) => new Date(seconds * 1000).toISOString().slice(14, 19);
const AudioRecorder = ({
  path,
  getFormValues,
  setPronunciation,
  record,
  originalRecord: originalRecordProp,
  formTitle,
  formTooltip,
  warningMessage,
  index,
}: {
  path: string,
  getFormValues: (key: string) => any,
  setPronunciation: (path: string, value: any) => any,
  record: Record | Example | Word,
  originalRecord: Record,
  formTitle?: string,
  formTooltip?: string,
  warningMessage?: string,
  index?: number
}): ReactElement => {
  const originalRecord = record.originalWordId || record.originalExampleId
    ? originalRecordProp
    : record;
  const pathLabel = path === 'headword'
    ? 'Standard Igbo'
    : path.startsWith('examples') // Handles path for nested examples
      ? 'Example'
      : path;
  const valuePath = path.startsWith('dialects')
    ? `${path}.pronunciation`
    : path.startsWith('pronunciations')
      ? path
      : 'pronunciation';
  const formValuePath = path.startsWith('dialects')
    ? `${path}.pronunciation`
    : path.startsWith('pronunciations')
      ? path
      : 'pronunciation';
  const [pronunciationValue, setPronunciationValue] = useState(null);
  const [audioBlob, isRecording, startRecording, stopRecording, recordingDuration] = useRecorder();
  const toast = useToast();

  const cleanedFormValue = (formValue: string | { audio?: string }) => (
    typeof formValue === 'string' ? formValue : formValue?.audio
  );

  /* Resets the audio pronunciation to its original value */
  const resetRecording = () => {
    const pronunciationPath = valuePath;
    const formValue = cleanedFormValue(getFormValues(formValuePath));
    const originalPronunciationValue = get(originalRecord, `${pronunciationPath}`);
    setPronunciation(formValuePath, originalPronunciationValue?.audio || originalPronunciationValue);
    setPronunciationValue(formValue);
    toast({
      title: 'Reset Audio Pronunciation',
      description: 'The audio pronunciation for this slot has been reset to its original value',
      status: 'info',
      duration: 4000,
      isClosable: true,
    });
  };

  const shouldRenderNewPronunciationLabel = () => {
    const formValue = cleanedFormValue(getFormValues(formValuePath));
    // Handle objects that include the audio key
    const currentPronunciationPath = formValue;
    return currentPronunciationPath && currentPronunciationPath.startsWith('data');
  };

  const renderStatusLabel = () => (
    <Box className="text-center flex flex-row justify-center">
      {pronunciationValue && !isRecording ? (
        <Box className="flex flex-col">
          <ReactAudioPlayer
            data-test={`${path}-audio-playback`}
            style={{ height: '40px', width: '250px' }}
            id="audio"
            src={pronunciationValue}
            controls
          />
          {shouldRenderNewPronunciationLabel() && (
            <chakra.span className="text-green-500 mt-2" fontFamily="Silka">New pronunciation recorded</chakra.span>
          )}
        </Box>
      ) : <chakra.span className="text-gray-700 italic" fontFamily="Silka">No audio pronunciation</chakra.span>}
    </Box>
  );

  /* Grabbing the default pronunciation value for the word or example document */
  useEffect(() => {
    if ((has(record, 'pronunciations') || has(record, 'pronunciation')) && !pronunciationValue) {
      const formValue = cleanedFormValue(get(record, valuePath));
      setPronunciationValue(formValue);
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
    if (base64data) {
      setPronunciation(formValuePath, base64data);
      setPronunciationValue(base64data);
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
    <Box className="flex flex-col w-full my-2">
      <FormHeader
        title={typeof index === 'number' ? `${index + 1}. ${formTitle}` : formTitle}
        tooltip={formTooltip}
      />
      <Box
        data-test="word-pronunciation-input-container"
        width="full"
        backgroundColor="gray.200"
        borderRadius="md"
        p={3}
      >
        <Box className="flex flex-col justify-center items-center w-full lg:space-x-4">
          {!isRecording ? (
            <Box className={`flex flex-row justify-center
            ${pronunciationValue ? 'items-start' : 'items-center'} space-x-3`}
            >
              <Tooltip label="Start recording">
                <Button
                  borderRadius="full"
                  borderColor="gray.300"
                  borderWidth="3px"
                  backgroundColor="white"
                  height="44px"
                  width="44px"
                  _hover={{
                    backgroundColor: 'gray.100',
                  }}
                  _active={{
                    backgroundColor: 'gray.100',
                  }}
                  padding="0px"
                  data-test={`start-recording-button${path === 'headword' ? '' : `-${path}`}`}
                  className="flex justify-center items-start"
                  onClick={startRecording}
                >
                  <Box height="10px" width="10px" borderRadius="full" backgroundColor="red.600" />
                </Button>
              </Tooltip>
              {renderStatusLabel()}
              <Tooltip label="Reset recording">
                <IconButton
                  aria-label="Reset recording"
                  icon={<RepeatIcon color="gray.600" />}
                  data-test={`reset-recording-button${path === 'headword' ? '' : `-${path}`}`}
                  backgroundColor="gray.300"
                  onClick={resetRecording}
                  borderRadius="full"
                  _hover={{
                    backgroundColor: 'gray.400',
                  }}
                  variant="ghost"
                />
              </Tooltip>
            </Box>
          ) : (
            <Box>
              <Box className="flex flex-row justify-center items-center space-x-3">
                <Button
                  borderRadius="full"
                  borderColor="gray.300"
                  borderWidth="3px"
                  backgroundColor="white"
                  height="50px"
                  width="50px"
                  _hover={{
                    backgroundColor: 'gray.100',
                  }}
                  _active={{
                    backgroundColor: 'gray.100',
                  }}
                  padding="0px"
                  data-test={`stop-recording-button${path === 'headword' ? '' : `-${path}`}`}
                  className="flex justify-center items-center"
                  onClick={stopRecording}
                >
                  <Box height="12px" width="12px" backgroundColor="gray.600" />
                </Button>
                <canvas id="canvas" height={60} width={150} className="mb-3" />
              </Box>
              <Box style={{ fontFamily: 'monospace' }} className="w-full flex flex-row justify-center items-center">
                {convertToTime(recordingDuration)}
              </Box>
              {renderStatusLabel()}
            </Box>
          )}
        </Box>
        {warningMessage ? (
          <Box
            mt={2}
            p={2}
            backgroundColor="yellow.100"
            borderRadius="md"
            data-test="audio-recording-warning-message"
          >
            <Text color="yellow.700">{warningMessage}</Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

AudioRecorder.defaultProps = {
  formTitle: 'Word Pronunciation',
  formTooltip: 'Record the audio for the headword only one time. You are able to record over pre-existing recordings.',
};

export default AudioRecorder;
