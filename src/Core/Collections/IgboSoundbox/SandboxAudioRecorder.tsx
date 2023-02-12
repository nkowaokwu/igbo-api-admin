import React, { ReactElement, useEffect, useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import {
  Box,
  Button,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import useRecorder from 'src/hooks/useRecorder';

const convertToTime = (seconds) => new Date(seconds * 1000).toISOString().slice(14, 19);
const SandboxAudioRecorder = ({ pronunciation, setPronunciation = () => {}, canRecord = true }: {
  pronunciation: string,
  setPronunciation?: (value: string) => any,
  canRecord?: boolean,
}): ReactElement => {
  const [pronunciationValue, setPronunciationValue] = useState(null);
  const [audioBlob, isRecording, startRecording, stopRecording, recordingDuration] = useRecorder();
  const toast = useToast();

  const shouldRenderNewPronunciationLabel = () => !pronunciationValue;

  const renderStatusLabel = () => (
    <Box className="text-center flex flex-row justify-center">
      {pronunciationValue && !isRecording ? (
        <Box className="flex flex-col">
          <ReactAudioPlayer
            style={{ height: '40px', width: '250px' }}
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
  );

  /** Listen to changes to the audioBlob for the
   * current pronunciation and saves it. If getFormValues
   * doesn't have a pronunciation key living on the object yet,
   * the platform will not overwrite the pronunciationValue
   * with undefined.
   * */
  useEffect(() => {
    const base64data = audioBlob;
    if (base64data) {
      setPronunciation(base64data);
      setPronunciationValue(base64data);
    }
    if (base64data) {
      toast({
        title: 'Recorded new audio',
        description: 'New audio recorded',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [audioBlob]);

  useEffect(() => {
    setPronunciationValue(pronunciation);
  }, [pronunciation]);

  return (
    <Box className="flex flex-col w-full my-2">
      <Box
        data-test="word-pronunciation-input-container"
        width="full"
        backgroundColor="gray.200"
        borderRadius="md"
        p={3}
      >
        <Box className="flex flex-col justify-center items-center w-full lg:space-x-4">
          {!canRecord ? (
            renderStatusLabel()
          ) : !isRecording ? (
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
                  data-test="start-recording-button"
                  className="flex justify-center items-start"
                  onClick={startRecording}
                >
                  <Box height="10px" width="10px" borderRadius="full" backgroundColor="red.600" />
                </Button>
              </Tooltip>
              {renderStatusLabel()}
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
                  data-test="stop-recording-button"
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
      </Box>
    </Box>
  );
};

export default SandboxAudioRecorder;
