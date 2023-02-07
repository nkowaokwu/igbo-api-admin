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
import { ArrowBackIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { getRandomExampleSuggestionsToReview, putRandomExampleSuggestions } from 'src/shared/DataCollectionAPI';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import SandboxAudioRecorder from './SandboxAudioRecorder';
import Completed from './Completed';

const cardMessage = {
  [ReviewActions.APPROVE]: 'You have marked this audio as approved',
  [ReviewActions.DENY]: 'You have marked this audio as denied',
  [ReviewActions.SKIP]: 'You have skipped this audio',
};

const cardMessageColor = {
  [ReviewActions.APPROVE]: 'green',
  [ReviewActions.DENY]: 'red',
  [ReviewActions.SKIP]: 'gray',
};

const ProgressCircles = ({ reviews, exampleIndex } : { reviews: ReviewActions[], exampleIndex: number }) => (
  <Box display="flex" flexDirection="row" className="space-x-6" my="6">
    {reviews.map((review, reviewIndex) => (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          borderRadius="full"
          backgroundColor="white"
          borderWidth="2px"
          borderColor={cardMessageColor[review]}
          height="40px"
          width="40px"
        />
        <Text userSelect="none" opacity={exampleIndex === reviewIndex ? 1 : 0} mt="2">☝🏾</Text>
      </Box>
    ))}
  </Box>
);

const VerifySentenceAudio = (): ReactElement => {
  const [examples, setExamples] = useState<ExampleSuggestion[] | null>(null);
  const [reviews, setReviews] = useState<ReviewActions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(-1);
  const isCompleteDisabled = reviews.some((review) => !review) || isUploading;

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
  };

  const handleDeny = () => {
    updateReviews(ReviewActions.DENY);
    handleNext();
  };

  const handleApprove = () => {
    updateReviews(ReviewActions.APPROVE);
    handleNext();
  };

  const handleUploadAudio = async () => {
    try {
      const payload = examples.map((example, exampleIndex) => ({
        id: example.id,
        review: reviews[exampleIndex],
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
        const { data: randomExamples } = await getRandomExampleSuggestionsToReview();
        setExamples(randomExamples);
        setExampleIndex(0);
        setReviews(new Array(randomExamples.length).fill(''));
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
      <Heading as="h1">Verify sentence audio</Heading>
      <Text>Listen closely to each sentence and approve if the audio matches with its sentence</Text>
      <Box
        backgroundColor="white"
        boxShadow="md"
        borderRadius="md"
        height={['64', 'sm']}
        width={['full', 'lg']}
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
      <Text
        userSelect="none"
        color={cardMessageColor[reviews[exampleIndex]]}
        opacity={reviews[exampleIndex] ? 1 : 0}
      >
        {cardMessage[reviews[exampleIndex]] || 'Nothing'}
      </Text>
      <Text>{`${exampleIndex + 1} / ${examples.length}`}</Text>
      <ProgressCircles reviews={reviews} exampleIndex={exampleIndex} />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        className="space-y-3"
      >
        <SandboxAudioRecorder pronunciation={examples[exampleIndex].pronunciation} canRecord={false} />
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          className="space-x-3"
        >
          <Button
            colorScheme="red"
            onClick={handleDeny}
            rightIcon={<SmallCloseIcon />}
            aria-label="Deny audio"
          >
            Deny
          </Button>
          <Tooltip label="Skipping will mark this sentence audio as neither approved nor denied. It has been skipped.">
            <Button
              colorScheme="gray"
              onClick={handleSkip}
              aria-label="Skip sentence"
            >
              Skip
            </Button>
          </Tooltip>
          <Button
            colorScheme="green"
            onClick={handleApprove}
            rightIcon={<CheckIcon />}
            aria-label="Approve audio"
          >
            Approve
          </Button>
        </Box>
        <Box
          data-test="editor-recording-options"
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          className="space-x-3"
        >
          <Tooltip label="You will go back to the previous sentence to review. You will not lose your progress.">
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
          <Tooltip label="Review all sentences before completing.">
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
        </Box>
      </Box>
    </Box>
  ) : isComplete ? (
    <Completed setIsComplete={setIsComplete} />
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
