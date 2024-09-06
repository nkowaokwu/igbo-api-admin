import React, { ReactElement, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Box, IconButton, Text, Tooltip, useToast, chakra } from '@chakra-ui/react';
import { FiRefreshCw, FiMic, FiStopCircle } from 'react-icons/fi';
import useRecorder from 'src/hooks/useRecorder';
import FormHeader from '../FormHeader';

const convertToTime = (seconds) => new Date(seconds * 1000).toISOString().slice(14, 19);

const RecorderBase = ({
  path,
  formTitle,
  formTooltip,
  warningMessage,
  hideTitle = false,
  onStopRecording,
  onResetRecording,
  audioValue,
  toastEnabled = true,
}: {
  path: string;
  formTitle?: string;
  formTooltip?: string;
  warningMessage?: string;
  hideTitle?: boolean;
  onStopRecording: (audioBlob: string) => void;
  onResetRecording: () => void;
  audioValue?: string;
  toastEnabled?: boolean;
}): ReactElement => {
  const [audioBlob, isRecording, startRecording, stopRecording, recordingDuration] = useRecorder();
  const toast = useToast();
  const pronunciationValue = typeof audioValue === 'string' ? audioValue : audioBlob;

  const shouldRenderNewPronunciationLabel = () => pronunciationValue && pronunciationValue.startsWith('data');

  const renderStatusLabel = () => (
    <Box className="text-center flex flex-row justify-center" data-test={`${path}-audio-playback-container`}>
      {pronunciationValue && !isRecording ? (
        <>
          <Box className="flex flex-col justify-center items-center" data-test={`${path}-audio-playback`}>
            <ReactAudioPlayer style={{ height: '40px', width: '150px' }} id="audio" src={pronunciationValue} controls />
          </Box>
        </>
      ) : null}
    </Box>
  );

  useEffect(() => {
    onStopRecording(audioBlob);

    if (audioBlob && toastEnabled) {
      toast({
        title: 'Recorded new audio',
        position: 'top-right',
        variant: 'left-accent',
        description: 'A new audio pronunciation has been recorded',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [audioBlob]);

  return (
    <Box className="flex flex-col w-full my-2">
      {!hideTitle ? <FormHeader title={formTitle} tooltip={formTooltip} /> : null}
      <Box
        data-test="word-pronunciation-input-container"
        width="full"
        className="flex flex-col justify-center items-center rounded"
        backgroundColor="gray.200"
        borderRadius="md"
        p={3}
      >
        <Box className="flex flex-col justify-center items-center w-full lg:space-x-4">
          {!isRecording ? (
            <Box className="flex flex-col justify-center items-center space-y-1">
              <Box
                className={`flex flex-row justify-center space-x-3
            ${pronunciationValue ? 'items-start' : 'items-center'}`}
              >
                <Tooltip label="Start recording">
                  <IconButton
                    aria-label="Record"
                    icon={<FiMic color="white" />}
                    variant="ghost"
                    borderRadius="full"
                    backgroundColor="red.400"
                    _hover={{ backgroundColor: 'red.400' }}
                    _active={{ backgroundColor: 'red.400' }}
                    _focus={{ backgroundColor: 'red.400' }}
                    padding="0px"
                    data-test={`start-recording-button${path === 'headword' ? '' : `-${path}`}`}
                    className="flex justify-center items-start"
                    onClick={startRecording}
                  />
                </Tooltip>
                {renderStatusLabel()}
                <Tooltip label="Reset recording">
                  <IconButton
                    aria-label="Reset recording"
                    icon={<FiRefreshCw color="gray.600" />}
                    data-test={`reset-recording-button${path === 'headword' ? '' : `-${path}`}`}
                    backgroundColor="white"
                    _hover={{ backgroundColor: 'white' }}
                    onClick={onResetRecording}
                    borderRadius="full"
                    variant="ghost"
                  />
                </Tooltip>
              </Box>
              {!pronunciationValue && !isRecording ? (
                <chakra.span className="italic" fontFamily="Silka" fontSize="sm" color="gray.700">
                  No audio pronunciation
                </chakra.span>
              ) : null}
              {shouldRenderNewPronunciationLabel() ? (
                <chakra.span className="mt-2" fontFamily="Silka" fontSize="sm" color="green.700">
                  New pronunciation recorded
                </chakra.span>
              ) : null}
            </Box>
          ) : (
            <Box>
              <Box className="flex flex-row justify-center items-center space-x-3">
                <IconButton
                  aria-label="Stop"
                  icon={<FiStopCircle color="white" />}
                  borderRadius="full"
                  backgroundColor="red.400"
                  _hover={{ backgroundColor: 'red.400' }}
                  _active={{ backgroundColor: 'red.400' }}
                  _focus={{ backgroundColor: 'red.400' }}
                  padding="0px"
                  data-test={`stop-recording-button${path === 'headword' ? '' : `-${path}`}`}
                  className="flex justify-center items-center"
                  onClick={stopRecording}
                />
                <canvas id="canvas" height={20} width={100} />
                <Box style={{ fontFamily: 'monospace' }} className="w-full flex flex-row justify-center items-center">
                  {convertToTime(recordingDuration)}
                </Box>
              </Box>
              {renderStatusLabel()}
            </Box>
          )}
        </Box>
        {warningMessage ? (
          <Box mt={2} p={2} backgroundColor="yellow.100" borderRadius="md" data-test="audio-recording-warning-message">
            <Text color="yellow.700" fontSize="sm">
              {warningMessage}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default RecorderBase;
