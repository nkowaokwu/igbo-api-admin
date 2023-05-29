import React, { useEffect, useState, ReactElement } from 'react';
import { noop } from 'lodash';
import {
  Box,
  Button,
  Heading,
  IconButton,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  CheckIcon,
  SmallCloseIcon,
} from '@chakra-ui/icons';
import {
  getRandomExampleSuggestionsToReview,
  putReviewForRandomExampleSuggestions,
} from 'src/shared/DataCollectionAPI';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import SandboxAudioRecorder from './SandboxAudioRecorder';
import Completed from '../components/Completed';
import EmptyExamples from './EmptyExamples';
import ProgressCircles from './components/ProgressCircles';
import CardMessage from './constants/CardMessage';
import CardMessageColor from './constants/CardMessageColor';
import InteractionButton from './components/InteractionButton';

// TODO: write frontend tests for navigating between different views

const VerifySentenceAudio = ({
  setIsDirty,
  goHome,
} : {
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
  goHome: () => void,
}): ReactElement => {
  const [examples, setExamples] = useState<ExampleSuggestion[] | null>(null);
  const [reviews, setReviews] = useState<ReviewActions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(-1);
  const isCompleteDisabled = reviews.some((review) => !review) || isUploading;
  const toast = useToast();

  const updateReviews = (action: ReviewActions) => {
    const updatedReviews = [...reviews];
    updatedReviews[exampleIndex] = action;
    setReviews(updatedReviews);
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
    updateReviews(ReviewActions.SKIP);
    handleNext();
    setIsDirty(true);
  };

  const handleDeny = () => {
    updateReviews(ReviewActions.DENY);
    handleNext();
    setIsDirty(true);
  };

  const handleApprove = () => {
    updateReviews(ReviewActions.APPROVE);
    handleNext();
    setIsDirty(true);
  };

  const handleUploadReviews = async () => {
    try {
      const payload = examples.map((example, exampleIndex) => ({
        id: example.id,
        review: reviews[exampleIndex],
      }));
      setIsLoading(true);
      await putReviewForRandomExampleSuggestions(payload);
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to upload example sentence reviews.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsUploading(true);
      await handleUploadReviews();
      setIsComplete(true);
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to complete verifying example sentences.',
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
        const { data: randomExamples } = await getRandomExampleSuggestionsToReview();
        setExamples(randomExamples);
        setExampleIndex(0);
        setReviews(new Array(randomExamples.length).fill(''));
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
      className="space-y-4 p-6"
    >
      <Heading as="h1" textAlign="center" fontSize="2xl" color="gray.600">
        Listen to know if this sentence matches the audio
      </Heading>
      <Text fontFamily="Silka">The audio should be understandable Igbo</Text>
      <Box
        backgroundColor="gray.100"
        borderRadius="md"
        borderColor="gray.300"
        borderWidth="1px"
        minHeight={32}
        width={['full', 'lg']}
        m="12"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p="6"
        className="space-y-6"
      >
        <Text fontSize="xl" textAlign="center" fontFamily="Silka" color="gray.700">
          {examples[exampleIndex].igbo}
        </Text>
        <SandboxAudioRecorder pronunciation={examples[exampleIndex].pronunciations[0].audio} canRecord={false} />
      </Box>
      <Text
        userSelect="none"
        color={CardMessageColor[reviews[exampleIndex]]}
        opacity={reviews[exampleIndex] ? 1 : 0}
      >
        {CardMessage[reviews[exampleIndex]] || 'Nothing'}
      </Text>
      <Box className="w-full flex flex-row justify-center items-center space-x-4">
        <Tooltip label="You will go back to the previous sentence to review. You will not lose your progress.">
          <IconButton
            variant="ghost"
            onClick={exampleIndex !== 0 ? handleBack : noop}
            icon={<ArrowBackIcon />}
            aria-label="Previous sentence"
            disabled={exampleIndex === 0}
            _hover={{
              backgroundColor: 'white',
            }}
            _active={{
              backgroundColor: 'white',
            }}
            _focus={{
              backgroundColor: 'white',
            }}
          />
        </Tooltip>
        <Text fontFamily="Silka" fontWeight="bold">{`${exampleIndex + 1} / ${examples.length}`}</Text>
        <IconButton
          variant="ghost"
          onClick={!reviews[exampleIndex]
            ? handleSkip
            : exampleIndex === reviews.length - 1
              ? noop
              : handleNext}
          icon={<ArrowForwardIcon />}
          aria-label="Next sentence"
          disabled={exampleIndex === reviews.length - 1}
          _hover={{
            backgroundColor: 'white',
          }}
          _active={{
            backgroundColor: 'white',
          }}
          _focus={{
            backgroundColor: 'white',
          }}
        />
      </Box>
      <ProgressCircles reviews={reviews} exampleIndex={exampleIndex} />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        className="space-y-3"
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          className="space-x-3"
        >
          <InteractionButton
            onClick={handleDeny}
            rightIcon={<SmallCloseIcon />}
            ariaLabel="Deny audio"
          >
            Deny
          </InteractionButton>
          <InteractionButton
            onClick={handleApprove}
            rightIcon={<CheckIcon />}
            ariaLabel="Approve audio"
          >
            Approve
          </InteractionButton>
        </Box>
        <Box
          data-test="editor-recording-options"
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          className="space-x-3"
        >
          <Tooltip label="Review all sentences before completing.">
            <Box>
              <Button
                colorScheme="green"
                onClick={!isCompleteDisabled ? handleComplete : noop}
                rightIcon={(() => <>💾</>)()}
                aria-label="Complete recordings"
                disabled={isCompleteDisabled}
                borderRadius="full"
                fontFamily="Silka"
                fontWeight="bold"
                p={6}
              >
                Submit Batch
              </Button>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  ) : noExamples ? (
    <EmptyExamples setIsDirty={setIsDirty} goHome={goHome} />
  ) : isComplete ? (
    <Completed
      type={CrowdsourcingType.VERIFY_EXAMPLE_AUDIO}
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

export default VerifySentenceAudio;
