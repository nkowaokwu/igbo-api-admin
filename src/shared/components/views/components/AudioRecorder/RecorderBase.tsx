import React, { ReactElement, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Box, Button, IconButton, Text, Tooltip, useToast, chakra } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
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
            <chakra.span className="text-green-500 mt-2" fontFamily="Silka">
              New pronunciation recorded
            </chakra.span>
          )}
        </Box>
      ) : !isRecording ? (
        <chakra.span className="text-gray-700 italic" fontFamily="Silka">
          No audio pronunciation
        </chakra.span>
      ) : null}
    </Box>
  );

  useEffect(() => {
    onStopRecording(audioBlob);

    if (audioBlob && toastEnabled) {
      toast({
        title: 'Recorded new audio',
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
        className="flex flex-col justify-center items-center"
        backgroundColor="gray.100"
        borderRadius="md"
        minHeight="96px"
        p={3}
      >
        <Box className="flex flex-col justify-center items-center w-full lg:space-x-4">
          {!isRecording ? (
            <Box
              className={`flex flex-row justify-center
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
                  onClick={onResetRecording}
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
                <canvas id="canvas" height={20} width={150} />
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
            <Text color="yellow.700">{warningMessage}</Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default RecorderBase;
