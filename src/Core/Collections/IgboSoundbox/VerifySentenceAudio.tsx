import React, { useEffect, useState, ReactElement } from 'react';
import { compact, cloneDeep, noop } from 'lodash';
import { Box, Heading, Link, Text, useToast } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import pluralize from 'pluralize';
import ResourceNavigationController from 'src/Core/Collections/components/ResourceNavigationController';
import {
  getRandomExampleSuggestionsToReview,
  putReviewForRandomExampleSuggestions,
} from 'src/shared/DataCollectionAPI';
import Spinner from 'src/shared/primitives/Spinner';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import { RECORDING_AUDIO_STANDARDS_DOC } from 'src/Core/constants';
import { Card } from 'src/shared/primitives';
import { API_ROUTE } from 'src/shared/constants';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';
import SandboxAudioReviewer from './SandboxAudioReviewer';
import Completed from '../components/Completed';
import EmptyExamples from './EmptyExamples';
import { SentenceVerification } from './types/SentenceVerification';

const DEFAULT_CURRENT_EXAMPLE = { source: { text: '', language: LanguageEnum.UNSPECIFIED, pronunciations: [] } };

const VerifySentenceAudio = ({
  setIsDirty,
}: {
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactElement => {
  const [examples, setExamples] = useState<ExampleSuggestion[] | null>(null);
  const [reviews, setReviews] = useState<SentenceVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(-1);
  const [visitedLastReviewIndex, setVisitedLastReviewIndex] = useState(false);
  const isCompleteEnabled =
    !isUploading && reviews.some(({ reviews }) => compact(Object.values(reviews)).length) && visitedLastReviewIndex;
  const toast = useToast();
  const userProjectPermission = React.useContext(UserProjectPermissionContext);
  const currentExample = Array.isArray(examples)
    ? examples[exampleIndex] || DEFAULT_CURRENT_EXAMPLE
    : DEFAULT_CURRENT_EXAMPLE;

  const updateReviews = (pronunciationId: string, action: ReviewActions) => {
    const clonedReviews = cloneDeep(reviews);
    const currentExampleReviews = clonedReviews[exampleIndex].reviews;
    currentExampleReviews[pronunciationId] = action;
    clonedReviews[exampleIndex].reviews = currentExampleReviews;
    setReviews(clonedReviews);
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

  const handleOnDeny = (pronunciationId: string) => {
    updateReviews(pronunciationId, ReviewActions.DENY);
    setIsDirty(true);
  };

  const handleOnApprove = (pronunciationId: string) => {
    updateReviews(pronunciationId, ReviewActions.APPROVE);
    setIsDirty(true);
  };

  const handleUploadReviews = async () => {
    try {
      const payload: SentenceVerification[] = reviews;
      const totalReviewCount = reviews.reduce(
        (finalCount, { reviews }) =>
          finalCount + Object.values(reviews).filter((review) => review !== ReviewActions.SKIP).length,
        0,
      );
      setIsLoading(true);
      await putReviewForRandomExampleSuggestions(payload);
      toast({
        title: 'Gained points 🎉',
        position: 'top-right',
        variant: 'left-accent',
        description: `You have reviewed ${pluralize('audio recording', totalReviewCount, true)}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Unable to save points',
        position: 'top-right',
        variant: 'left-accent',
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
        try {
          const { data: randomExamples } = await getRandomExampleSuggestionsToReview({
            languages: userProjectPermission.languages,
          });
          setExamples(randomExamples);
          setExampleIndex(0);

          const defaultReviews: SentenceVerification[] = randomExamples.map(({ id, pronunciations = [] }) => ({
            id: id.toString(),
            reviews: pronunciations.reduce(
              (reviews, { _id }) => ({
                ...reviews,
                [_id.toString()]: ReviewActions.SKIP,
              }),
              {},
            ),
          }));
          setReviews(defaultReviews);
        } catch (err) {
          toast({
            title: 'An error occurred',
            description: 'Unable to retrieve example sentences.',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [isComplete]);

  useEffect(() => {
    if (exampleIndex + 1 === examples?.length - 1) {
      setVisitedLastReviewIndex(true);
    }
  }, [exampleIndex, examples]);

  const shouldRenderExamples =
    !isLoading && Array.isArray(examples) && examples?.length && examples?.length === reviews?.length && !isComplete;
  const noExamples = !isLoading && !examples?.length && !isComplete;
  // eslint-disable-next-line max-len
  const currentExampleHref = `${API_ROUTE}/#/${Collections.EXAMPLE_SUGGESTIONS}/${examples?.[exampleIndex]?.id}/${Views.SHOW}`;

  return shouldRenderExamples ? (
    <Box className="flex flex-col justify-between items-center p-6 h-full">
      <Box className="flex flex-col items-center w-full space-y-4">
        <Heading as="h1" textAlign="center" fontSize="2xl" color="gray.600">
          Listen to know if this sentence matches the audio
        </Heading>
        <Text fontFamily="Silka">
          Each audio should follow our{' '}
          <Link textDecoration="underline" href={RECORDING_AUDIO_STANDARDS_DOC} target="_blank">
            Recording Audio Standards
            <ExternalLinkIcon boxSize="3" ml={1} />
          </Link>{' '}
          document.
        </Text>
        <Card text={currentExample.source.text} href={currentExampleHref}>
          <SandboxAudioReviewer
            pronunciations={currentExample.source.pronunciations}
            onApprove={handleOnApprove}
            onDeny={handleOnDeny}
            review={reviews[exampleIndex]}
          />
        </Card>
      </Box>
      <Box data-test="editor-recording-options" className="flex flex-col justify-center items-center space-y-4 w-full">
        <ResourceNavigationController
          index={exampleIndex}
          resources={reviews}
          onBack={handleBack}
          onNext={handleNext}
          onSkip={noop}
          onComplete={handleComplete}
          isCompleteEnabled={isCompleteEnabled}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  ) : noExamples ? (
    <EmptyExamples setIsDirty={setIsDirty} />
  ) : isComplete ? (
    <Completed type={CrowdsourcingType.VERIFY_EXAMPLE_AUDIO} setIsComplete={setIsComplete} setIsDirty={setIsDirty} />
  ) : (
    <Spinner />
  );
};

export default VerifySentenceAudio;
