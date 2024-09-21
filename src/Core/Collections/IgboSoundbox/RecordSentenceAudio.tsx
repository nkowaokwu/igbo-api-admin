import React, { useEffect, useState, ReactElement } from 'react';
import { Box, Heading, Text, useToast, chakra } from '@chakra-ui/react';
import pluralize from 'pluralize';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import { getRandomExampleSuggestionsToRecord, putAudioForRandomExampleSuggestions } from 'src/shared/DataCollectionAPI';
import { Card, Spinner } from 'src/shared/primitives';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import RecorderBase from 'src/shared/components/views/components/AudioRecorder/RecorderBase';
import ResourceNavigationController from 'src/Core/Collections/components/ResourceNavigationController';
import { API_ROUTE } from 'src/shared/constants';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import Completed from '../components/Completed';
import EmptyExamples from './EmptyExamples';

const RecordSentenceAudio = ({
  setIsDirty,
}: {
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactElement => {
  const [examples, setExamples] = useState<ExampleSuggestion[] | null>(null);
  const [pronunciations, setPronunciations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(-1);
  const [visitedLastExampleIndex, setVisitedLastExampleIndex] = useState(false);
  const isCompleteEnabled =
    !isUploading && pronunciations.some((pronunciation) => pronunciation) && visitedLastExampleIndex;
  const toast = useToast();
  const userProjectPermission = React.useContext(UserProjectPermissionContext);

  const handlePronunciation = (audioData) => {
    const updatedPronunciations = [...pronunciations];
    updatedPronunciations[exampleIndex] = audioData;
    setPronunciations(updatedPronunciations);
  };

  const handleResetPronunciation = () => {
    const updatedPronunciations = [...pronunciations];
    updatedPronunciations[exampleIndex] = '';
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
    setIsDirty(true);
    handleNext();
  };

  const handleUploadAudio = async () => {
    try {
      const payload = examples.map((example, exampleIndex) => ({
        id: example.id.toString(),
        pronunciation: pronunciations[exampleIndex],
      }));
      setIsLoading(true);
      await putAudioForRandomExampleSuggestions(payload);
      toast({
        title: 'Gained points 🎉',
        position: 'top-right',
        variant: 'left-accent',
        description: `You have gained ${pluralize(
          'point',
          payload.filter(({ pronunciation }) => pronunciation).length,
          true,
        )}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Unable to save points',
        position: 'top-right',
        variant: 'left-accent',
        description: `Unable to upload example sentence recordings.: ${err?.message || err?.details}`,
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
        try {
          const { data: randomExamples } = await getRandomExampleSuggestionsToRecord({
            languages: userProjectPermission.languages,
          });
          setExamples(randomExamples);
          setExampleIndex(0);
          setPronunciations(new Array(randomExamples.length).fill(''));
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
      setVisitedLastExampleIndex(true);
    }
  }, [exampleIndex, examples]);

  useEffect(() => {
    if (!pronunciations.every((pronunciation) => !pronunciation)) {
      setIsDirty(true);
    }
  }, [pronunciations]);

  const shouldRenderExamples = !isLoading && exampleIndex !== -1 && examples?.length && !isComplete;
  const noExamples = !isLoading && !examples?.length && !isComplete;
  const currentExample = examples?.[exampleIndex] || {
    source: { text: '', language: LanguageEnum.UNSPECIFIED, pronunciations: [] },
    id: '',
  };
  // eslint-disable-next-line max-len
  const currentExampleHref = `${API_ROUTE}/#/${Collections.EXAMPLE_SUGGESTIONS}/${examples?.[exampleIndex]?.id}/${Views.SHOW}`;

  return shouldRenderExamples ? (
    <Box className="flex flex-col justify-between items-center p-6 h-full">
      <Box className="flex flex-col justify-center items-center space-y-4">
        <Heading as="h1" textAlign="center" fontSize="2xl" color="gray.600">
          Record sentence audio
        </Heading>
        <Text fontFamily="Silka">Play audio and then record audio for each sentence</Text>
        <Text fontFamily="Silka" fontSize="sm" className="w-full lg:w-10/12">
          <chakra.span fontWeight="bold" mr="2">
            Note:
          </chakra.span>
          Sentence may contain grammatical and spelling errors. Record audio to match the exact spelling of each word.
        </Text>
        <Card text={currentExample.source.text} href={currentExampleHref} />
      </Box>
      <Box data-test="editor-recording-options" className="flex flex-col justify-center items-center space-y-4 w-full">
        <RecorderBase
          path="pronunciation"
          hideTitle
          onStopRecording={handlePronunciation}
          onResetRecording={handleResetPronunciation}
          audioValue={pronunciations[exampleIndex]}
          toastEnabled={false}
        />
        <ResourceNavigationController
          index={exampleIndex}
          resources={examples}
          onBack={handleBack}
          onNext={handleNext}
          onSkip={handleSkip}
          onComplete={handleComplete}
          isCompleteEnabled={isCompleteEnabled}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  ) : noExamples ? (
    <EmptyExamples recording setIsDirty={setIsDirty} />
  ) : isComplete ? (
    <Completed type={CrowdsourcingType.RECORD_EXAMPLE_AUDIO} setIsComplete={setIsComplete} setIsDirty={setIsDirty} />
  ) : (
    <Spinner />
  );
};

export default RecordSentenceAudio;
