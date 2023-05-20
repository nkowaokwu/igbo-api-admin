import React, { useEffect, useState, ReactElement } from 'react';
import { noop } from 'lodash';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import { getRandomExampleSuggestions, putRandomExampleSuggestions } from 'src/shared/DataCollectionAPI';
import { ActivityButton, Card, PrimaryButton } from 'src/shared/primitives';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import SandboxAudioRecorder from './SandboxAudioRecorder';
import Completed from '../components/Completed';
import EmptyExamples from './EmptyExamples';

const RecordSentenceAudio = ({
  setIsDirty,
  goHome,
} : {
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
  goHome: () => void,
}): ReactElement => {
  const [examples, setExamples] = useState<ExampleSuggestion[] | null>(null);
  const [pronunciations, setPronunciations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(-1);
  const isCompleteDisabled = (
    (pronunciations.every((pronunciation) => !pronunciation) || isUploading)
    || exampleIndex !== (examples?.length || 0) - 1
  );
  const toast = useToast();

  const handlePronunciation = (audioData) => {
    const updatedPronunciations = [...pronunciations];
    updatedPronunciations[exampleIndex] = audioData;
    setPronunciations(updatedPronunciations);
    setIsDirty(true);
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
    setIsDirty(true);
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
      toast({
        title: 'An error occurred',
        description: 'Unable to upload example sentence recordings.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      console.log('Unable to submit audio', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsUploading(true);
      await handleUploadAudio();
      setIsComplete(true);
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to complete recording example sentences.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
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
  const shouldRenderExamples = !isLoading && exampleIndex !== -1 && examples?.length && !isComplete;
  const noExamples = !isLoading && !examples?.length && !isComplete;

  return shouldRenderExamples ? (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      className="space-y-4 p-6 h-full lg:h-auto"
      width={{ base: '100vw', md: 'auto' }}
    >
      <Heading as="h1" textAlign="center" fontSize="2xl" color="gray.600">
        Record sentence audio
      </Heading>
      <Text fontFamily="Silka">Play audio and then record audio for each sentence</Text>
      <Card>
        <Text fontSize="xl" textAlign="center" fontFamily="Silka" color="gray.700">
          {examples[exampleIndex].igbo}
        </Text>
      </Card>
      <Box className="mb-12 w-full flex flex-row justify-center items-center space-x-4">
        <ActivityButton
          tooltipLabel="You will not lose your current progress by going back."
          onClick={exampleIndex !== 0 ? handleBack : noop}
          icon={<ArrowBackIcon />}
          aria-label="Previous sentence"
          disabled={exampleIndex === 0}
        />
        <Text fontFamily="Silka" fontWeight="bold">{`${exampleIndex + 1} / ${examples.length}`}</Text>
        <ActivityButton
          onClick={!examples[exampleIndex]
            ? handleSkip
            : exampleIndex === examples.length - 1
              ? noop
              : handleNext}
          icon={<ArrowForwardIcon />}
          aria-label="Next sentence"
          disabled={exampleIndex === examples.length - 1}
        />
      </Box>
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
          <Tooltip label={isCompleteDisabled ? 'Please record at least one audio to complete this section' : ''}>
            <Box>
              <PrimaryButton
                onClick={!isCompleteDisabled ? handleComplete : noop}
                rightIcon={(() => <>💾</>)()}
                aria-label="Complete recordings"
                disabled={isCompleteDisabled}
              >
                Submit Batch
              </PrimaryButton>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  ) : noExamples ? (
    <EmptyExamples recording goHome={goHome} setIsDirty={setIsDirty} />
  ) : isComplete ? (
    <Completed
      type={CrowdsourcingType.RECORD_EXAMPLE_AUDIO}
      setIsComplete={setIsComplete}
      setIsDirty={setIsDirty}
      goHome={goHome}
    />
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
