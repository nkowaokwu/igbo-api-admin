import React, { useEffect, useState, ReactElement } from 'react';
import { compact, cloneDeep, noop } from 'lodash';
import { Box, Heading, Text, useToast } from '@chakra-ui/react';
import pluralize from 'pluralize';
import ResourceNavigationController from 'src/Core/Collections/components/ResourceNavigationController';
import {
  getRandomExampleSuggestionForTranslationReview,
  putRandomExampleSuggestionReviewsForTranslation,
} from 'src/shared/DataCollectionAPI';
import Spinner from 'src/shared/primitives/Spinner';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import { Card } from 'src/shared/primitives';
import { API_ROUTE } from 'src/shared/constants';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import TranslateSentenceReview from 'src/Core/Collections/IgboSoundbox/TranslateSentenceReviewer';
import Completed from '../components/Completed';
import EmptyExamples from './EmptyExamples';
import {
  SentenceTranslationVerification,
  SentenceTranslationVerificationPayload,
  SentenceVerification,
} from './types/SoundboxInterfaces';

const DEFAULT_CURRENT_EXAMPLE = {
  source: { text: '', language: LanguageEnum.UNSPECIFIED, pronunciations: [] },
  translations: [],
};

const VerifyTranslateSentences = ({
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
  const currentExample = Array.isArray(examples)
    ? examples[exampleIndex] || DEFAULT_CURRENT_EXAMPLE
    : DEFAULT_CURRENT_EXAMPLE;

  const updateReviews = (translationId: string, action: ReviewActions) => {
    const clonedReviews = cloneDeep(reviews);
    const currentExampleReviews = clonedReviews[exampleIndex].reviews;
    currentExampleReviews[translationId] = action;
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

  const handleOnDeny = (translationId: string) => {
    updateReviews(translationId, ReviewActions.DENY);
    setIsDirty(true);
  };

  const handleOnApprove = (translationId: string) => {
    updateReviews(translationId, ReviewActions.APPROVE);
    setIsDirty(true);
  };

  const handleUploadReviews = async () => {
    try {
      const payload: SentenceTranslationVerificationPayload[] = reviews.map(({ id, reviews }) => ({
        id,
        translations: Object.entries(reviews).map(([translationId, review]) => ({ id: translationId, review })),
      }));
      const totalReviewCount = reviews.reduce(
        (finalCount, { reviews }) =>
          finalCount + Object.values(reviews).filter((review) => review !== ReviewActions.SKIP).length,
        0,
      );
      setIsLoading(true);
      await putRandomExampleSuggestionReviewsForTranslation(payload);
      toast({
        title: 'Completed 🎉',
        position: 'top-right',
        variant: 'left-accent',
        description: `You have reviewed ${pluralize('sentences', totalReviewCount, true)}`,
        status: 'success',
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
        description: 'Unable to complete verifying sentence audio.',
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
          const randomExamples = await getRandomExampleSuggestionForTranslationReview();
          setExamples(randomExamples);
          setExampleIndex(0);

          const defaultReviews: SentenceTranslationVerification[] = randomExamples.map(({ id }) => ({
            id: id.toString(),
            reviews: {},
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
          Read each translation and listen to each audio
        </Heading>
        <Text fontFamily="Silka">
          Ensure that each translation is correct and each audio accurately matches the translated text.
        </Text>
        <Card text={currentExample.source.text} href={currentExampleHref}>
          <Text fontSize="sm" color="gray.600">
            Language: {LanguageLabels[currentExample.source.language].label}
          </Text>
          <TranslateSentenceReview
            translations={currentExample.translations}
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

export default VerifyTranslateSentences;
