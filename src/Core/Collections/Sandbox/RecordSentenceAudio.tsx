import React, { useEffect, useState, ReactElement } from 'react';
import { noop } from 'lodash';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import { getRandomExampleSuggestions, putRandomExampleSuggestions } from 'src/shared/DataCollectionAPI';
import SandboxAudioRecorder from './SandboxAudioRecorder';
import Completed from './Completed';

const RecordSentenceAudio = (): ReactElement => {
  const [examples, setExamples] = useState<ExampleSuggestion[] | null>(null);
  const [pronunciations, setPronunciations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(-1);
  const isCompleteDisabled = pronunciations.every((pronunciation) => !pronunciation) || isUploading;

  const handlePronunciation = (audioData) => {
    const updatedPronunciations = [...pronunciations];
    updatedPronunciations[exampleIndex] = audioData;
    setPronunciations(updatedPronunciations);
  };

  const handleNext = () => {
    if (exampleIndex !== examples.length - 1) {
      setExampleIndex(exampleIndex + 1);
    }
  };

  const handleBack = () => {
    if (exampleIndex !== 0) {
      setExampleIndex(exampleIndex - 1);
    }
  };

  const handleSkip = () => {
    const updatedPronunciations = [...pronunciations];
    updatedPronunciations[exampleIndex] = '';
    setPronunciations(updatedPronunciations);
    handleNext();
  };

  const handleUploadAudio = async () => {
    try {
      const payload = examples.map((example, exampleIndex) => ({
        id: example.id,
        pronunciation: pronunciations[exampleIndex],
      }));
      setIsLoading(true);
      await putRandomExampleSuggestions(payload);
    } catch (err) {
      console.log('Unable to submit audio', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    console.log('Submit recordings');
    try {
      setIsUploading(true);
      await handleUploadAudio();
      setIsComplete(true);
    } catch (err) {
      console.log('Error while completing', err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isComplete) {
      setIsLoading(true);
      (async () => {
        const { data: randomExamples } = await getRandomExampleSuggestions();
        setExamples(randomExamples);
        setExampleIndex(0);
        setPronunciations(new Array(randomExamples.length).fill(''));
        setIsLoading(false);
      })();
    }
  }, [isComplete]);

  return !isLoading && exampleIndex !== -1 && !isComplete ? (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Heading as="h1">Record sentence audio</Heading>
      <Text>Record audio for each sentence</Text>
      <Box
        backgroundColor="white"
        boxShadow="md"
        borderRadius="md"
        height="sm"
        width="lg"
        m="12"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px="6"
      >
        <Text fontSize="2xl" textAlign="center">
          {examples[exampleIndex].igbo}
        </Text>
      </Box>
      <Text mb="12">{`${exampleIndex + 1} / ${examples.length}`}</Text>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        className="space-y-3"
      >
        <SandboxAudioRecorder
          pronunciation={pronunciations[exampleIndex]}
          setPronunciation={handlePronunciation}
        />
        <Box
          data-test="editor-recording-options"
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          className="space-x-3"
        >
          <Tooltip label="You will not lose your current progress by going back.">
            <Button
              colorScheme="orange"
              onClick={exampleIndex !== 0 ? handleBack : noop}
              leftIcon={<ArrowBackIcon />}
              aria-label="Previous sentence"
              disabled={exampleIndex === 0}
            >
              Back
            </Button>
          </Tooltip>
          <Tooltip label="You will skip this sentence without recording audio">
            <Button
              colorScheme="gray"
              onClick={handleSkip}
              aria-label="Skip sentence"
            >
              Skip
            </Button>
          </Tooltip>
          {exampleIndex !== examples.length - 1 ? (
            <Button
              colorScheme="blue"
              onClick={handleNext}
              rightIcon={<ArrowForwardIcon />}
              aria-label="Next sentence"
            >
              Next
            </Button>
          ) : (
            <Tooltip label={isCompleteDisabled ? 'Please record at least one audio to complete this section' : ''}>
              <Box>
                <Button
                  colorScheme="green"
                  onClick={!isCompleteDisabled ? handleComplete : noop}
                  aria-label="Complete recordings"
                  disabled={isCompleteDisabled}
                >
                  Complete
                </Button>
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  ) : isComplete ? (
    <Completed recording setIsComplete={setIsComplete} />
  ) : (
    <Box
      width="full"
      height="full"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Spinner color="green" />
    </Box>
  );
};

export default RecordSentenceAudio;
