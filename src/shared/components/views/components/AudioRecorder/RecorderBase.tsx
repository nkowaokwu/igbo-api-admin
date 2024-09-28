import React, { ReactElement, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Box, Text, useToast, chakra, HStack } from '@chakra-ui/react';
import StopButton from 'src/shared/components/views/components/AudioRecorder/components/StopButton';
import useRecorder from 'src/hooks/useRecorder';
import RecordButton from 'src/shared/components/views/components/AudioRecorder/components/RecordButton';
import ResetButton from 'src/shared/components/views/components/AudioRecorder/components/ResetButton';
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
  isMinimal = false,
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
  isMinimal?: boolean;
}): ReactElement => {
  const [audioBlob, isRecording, startRecording, stopRecording, recordingDuration] = useRecorder();
  const toast = useToast();
  const pronunciationValue = typeof audioValue === 'string' ? audioValue : audioBlob;
  const showAudioPlayer = pronunciationValue && !isRecording;

  const shouldRenderNewPronunciationLabel = () => pronunciationValue && pronunciationValue.startsWith('data');

  const renderStatusLabel = () => (
    <Box className="text-center flex flex-row justify-center" data-test={`${path}-audio-playback-container`}>
      {showAudioPlayer ? (
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

  const MinimalRecorderBase = () =>
    !isRecording ? (
      <HStack gap={2}>
        {showAudioPlayer ? null : <RecordButton onClick={startRecording} path={path} />}
        {showAudioPlayer ? (
          <>
            <ReactAudioPlayer style={{ height: '40px', width: '120px' }} id="audio" src={pronunciationValue} controls />
            <ResetButton onClick={onResetRecording} path={path} />
          </>
        ) : null}
      </HStack>
    ) : (
      <>
        <StopButton onClick={stopRecording} path={path} />
        <canvas id="canvas" height={20} width={70} />
        <Box style={{ fontFamily: 'monospace' }}>{convertToTime(recordingDuration)}</Box>
      </>
    );

  return isMinimal ? (
    <MinimalRecorderBase />
  ) : (
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
                <RecordButton onClick={startRecording} path={path} />
                {renderStatusLabel()}
                <ResetButton onClick={onResetRecording} path={path} />
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
                <StopButton onClick={stopRecording} path={path} />
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
