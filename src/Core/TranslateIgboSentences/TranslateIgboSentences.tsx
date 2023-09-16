import React, { useEffect, useState, ReactElement } from 'react';
import { Box, Heading, Text, Tooltip, useToast } from '@chakra-ui/react';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import {
  getRandomExampleSuggestionsToTranslate,
  putRandomExampleSuggestionsToTranslate,
} from 'src/shared/DataCollectionAPI';
import { Card, Input, Spinner } from 'src/shared/primitives';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import { API_ROUTE } from 'src/shared/constants';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import ResourceNavigationController from 'src/Core/Collections/components/ResourceNavigationController';
import Completed from 'src/Core/Collections/components/Completed';
import EmptyExamples from 'src/Core/Collections/IgboSoundbox/EmptyExamples';
import SubmitBatchButton from 'src/Core/Collections/components/SubmitBatchButton';

type Translation = {
  id: string;
  english: string;
};

const TranslateIgboSentences = (): ReactElement => {
  const [examples, setExamples] = useState<ExampleSuggestion[] | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(-1);
  const [visitedLastExampleIndex, setVisitedLastExampleIndex] = useState(false);

  const isCompleteEnabled = !isUploading && translations.some(({ english }) => english) && visitedLastExampleIndex;
  const toast = useToast();

  const handleNext = () => {
    setExampleIndex(exampleIndex + 1);
  };

  const handleBack = () => {
    setExampleIndex(exampleIndex - 1);
  };

  const handleSkip = () => {
    const updatedTranslations = [...translations];
    updatedTranslations[exampleIndex].english = '';
    setTranslations(updatedTranslations);
    handleNext();
  };

  const handleInputChange = (e) => {
    const updatedTranslations = [...translations];
    updatedTranslations[exampleIndex].english = e.target.value;
    setTranslations(updatedTranslations);
  };

  const handleSubmitTranslations = async () => {
    setIsLoading(true);
    try {
      await putRandomExampleSuggestionsToTranslate(translations);
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to complete uploading Igbo sentence translations.',
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
      await handleSubmitTranslations();
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
          const { data: randomExamples } = await getRandomExampleSuggestionsToTranslate();
          setExamples(randomExamples);
          const emptyTranslations = randomExamples.map(({ id, english }) => ({ id, english }));
          setTranslations(emptyTranslations);
          setExampleIndex(0);
        } catch (err) {
          console.log('the error', err);
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

  const shouldRenderExamples = !isLoading && exampleIndex !== -1 && examples?.length && !isComplete;
  const noExamples = !isLoading && !examples?.length && !isComplete;
  const currentExample = examples?.[exampleIndex] || { igbo: '', id: '' };
  // eslint-disable-next-line max-len
  const currentExampleHref = `${API_ROUTE}/#/${Collections.EXAMPLE_SUGGESTIONS}/${examples?.[exampleIndex]?.id}/${Views.SHOW}`;

  return shouldRenderExamples ? (
    <Box className="flex flex-col justify-between items-center p-6 h-full">
      <Box className="flex flex-col justify-center items-center space-y-4">
        <Heading as="h1" textAlign="center" fontSize="2xl" color="gray.600" mb="4">
          Translate Igbo Sentences
        </Heading>
        <Text fontFamily="Silka">Translate the following Igbo sentence into English</Text>
        <Card text={currentExample.igbo} href={currentExampleHref} />
      </Box>
      <Box data-test="editor-recording-options" className="flex flex-col justify-center items-center space-y-4 w-full">
        <Tooltip label={!isCompleteEnabled ? 'Please record at least one audio to complete this section' : ''}>
          <Box>
            <SubmitBatchButton
              isLoading={isLoading}
              isClickEnabled={isCompleteEnabled}
              onClick={handleComplete}
              isDisabled={!isCompleteEnabled}
              aria-label="Complete recordings"
            />
          </Box>
        </Tooltip>
        <Input
          placeholder="Type English translation here"
          px={2}
          value={translations[exampleIndex].english}
          onChange={handleInputChange}
          hideDiacritics
        />
        <ResourceNavigationController
          index={exampleIndex}
          resources={examples}
          onBack={handleBack}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      </Box>
    </Box>
  ) : noExamples ? (
    <EmptyExamples recording />
  ) : isComplete ? (
    <Completed type={CrowdsourcingType.TRANSLATE_IGBO_SENTENCE} setIsComplete={setIsComplete} />
  ) : (
    <Spinner />
  );
};

export default TranslateIgboSentences;
