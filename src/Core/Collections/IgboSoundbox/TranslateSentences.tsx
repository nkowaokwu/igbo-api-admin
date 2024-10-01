import React, { useEffect, useState, ReactElement } from 'react';
import { cloneDeep, compact, noop, omit } from 'lodash';
import { Box, Heading, Text, chakra, useToast, Input, HStack, Button, VStack } from '@chakra-ui/react';
import Select from 'react-select';
import { LuPlus } from 'react-icons/lu';
import { v4 as uuid } from 'uuid';
import ResourceNavigationController from 'src/Core/Collections/components/ResourceNavigationController';
import {
  getRandomExampleSuggestionsToTranslate,
  putRandomExampleSuggestionsToTranslate,
} from 'src/shared/DataCollectionAPI';
import Spinner from 'src/shared/primitives/Spinner';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import { Card } from 'src/shared/primitives';
import { API_ROUTE } from 'src/shared/constants';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import RecorderBase from 'src/shared/components/views/components/AudioRecorder/RecorderBase';
import Completed from '../components/Completed';
import EmptyExamples from './EmptyExamples';
import { SentenceTranslation, SentenceTranslationPayload } from './types/SoundboxInterfaces';

const DEFAULT_CURRENT_EXAMPLE = {
  id: '',
  source: { text: '', language: LanguageEnum.UNSPECIFIED, pronunciations: [] },
  translations: [],
};

const TranslateSentences = ({
  setIsDirty,
}: {
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactElement => {
  const [examples, setExamples] = useState<ExampleSuggestion[] | null>(null);
  const [translations, setTranslations] = useState<SentenceTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(-1);
  const [visitedLastReviewIndex, setVisitedLastReviewIndex] = useState(false);
  const userProjectPermission = React.useContext(UserProjectPermissionContext);
  const isCompleteEnabled =
    !isUploading &&
    translations.some(({ translations }) => compact(Object.values(translations)).length) &&
    visitedLastReviewIndex;
  const toast = useToast();
  const currentExample = Array.isArray(examples)
    ? examples[exampleIndex] || DEFAULT_CURRENT_EXAMPLE
    : DEFAULT_CURRENT_EXAMPLE;

  const maxTranslationLanguageOptions = userProjectPermission.languages.filter(
    (language) =>
      // Keep language option if the current sentence doesn't have a translation for the language
      currentExample.translations.every(({ language: translationLanguage }) => translationLanguage !== language) &&
      // Keep language if it's not the say language as the source text language
      currentExample.source.language !== language,
  );
  // Filters for languages that need translations
  const translationLanguageOptions = maxTranslationLanguageOptions
    .filter((language) =>
      // And keep language option if the current sentence's translations don't include the language
      translations[exampleIndex]?.translations?.every?.(
        ({ language: translationLanguage }) => translationLanguage !== language,
      ),
    )
    .map((language) => LanguageLabels[language]);
  // Show the Add Translation button if there are less translation than the max potential translations
  const showAddTranslationButton =
    translations[exampleIndex]?.translations?.length < maxTranslationLanguageOptions.length;

  const handlePronunciation = (audioData: string, translationIndex: number) => {
    const updatedTranslations = [...translations];
    updatedTranslations[exampleIndex].translations[translationIndex].pronunciations = [{ audio: audioData }];
    setTranslations(updatedTranslations);
  };

  const handleResetPronunciation = (translationIndex: number) => {
    const updatedTranslations = [...translations];
    updatedTranslations[exampleIndex].translations[translationIndex].pronunciations = [{ audio: '' }];
    setTranslations(updatedTranslations);
  };

  const handleSelectTranslationText = (text: string, translationIndex: number) => {
    const updatedTranslations = [...translations];
    updatedTranslations[exampleIndex].translations[translationIndex].text = text;
    setTranslations(updatedTranslations);
  };

  const handleSelectTranslationLanguage = (selectedLanguage: LanguageEnum, translationIndex: number) => {
    const updatedTranslations = [...translations];
    updatedTranslations[exampleIndex].translations[translationIndex].language = selectedLanguage;
    setTranslations(updatedTranslations);
  };

  const handleAddTranslation = () => {
    const updatedTranslations = [...translations];
    updatedTranslations[exampleIndex].translations.push({
      text: '',
      language: LanguageEnum.UNSPECIFIED,
      pronunciations: [{ audio: '' }],
      id: uuid(),
    });
    setTranslations(updatedTranslations);
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

  const handleComplete = async () => {
    try {
      setIsUploading(true);
      const payload: SentenceTranslationPayload[] = translations.map((translation) => ({
        ...cloneDeep(translation),
        translations: translation.translations
          .map((nestedTranslation) => omit(nestedTranslation, ['id']))
          .filter((nestedTranslation) => nestedTranslation.text),
      }));
      await putRandomExampleSuggestionsToTranslate(payload);
      setIsComplete(true);
      toast({
        title: 'Completed 🎉',
        position: 'top-right',
        variant: 'left-accent',
        description: `Your translations have been submitted`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: err.message,
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
          const randomExamples = await getRandomExampleSuggestionsToTranslate();
          setExamples(randomExamples);
          setTranslations(
            randomExamples.map(({ id }) => ({
              id,
              translations: [
                {
                  text: '',
                  language: LanguageEnum.UNSPECIFIED,
                  pronunciations: [{ audio: '' }],
                  id: uuid(),
                },
              ],
            })),
          );
          setExampleIndex(0);
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

  const shouldRenderExamples = !isLoading && Array.isArray(examples) && examples?.length && !isComplete;
  const noExamples = !isLoading && !examples?.length && !isComplete;
  // eslint-disable-next-line max-len
  const currentExampleHref = `${API_ROUTE}/#/${Collections.EXAMPLE_SUGGESTIONS}/${examples?.[exampleIndex]?.id}/${Views.SHOW}`;

  // TODO: unify card views
  return shouldRenderExamples ? (
    <VStack gap={8} p={6} justifyContent="space-between" height="full">
      <Box className="flex flex-col items-center w-full space-y-4">
        <Heading as="h1" textAlign="center" fontSize="2xl" color="gray.600">
          Translate the following sentence
        </Heading>
        <Text fontFamily="Silka">
          Translate this sentence is <chakra.span fontWeight="bold">all</chakra.span> languages you can speak. You can
          skip sentences that you cannot translate fully.
        </Text>
        <Card text={currentExample.source.text} href={currentExampleHref}>
          <Text fontSize="sm" color="gray.600">
            Language: {LanguageLabels[currentExample.source.language].label}
          </Text>
        </Card>
      </Box>
      <VStack gap={2} width="full">
        {translations[exampleIndex].translations.map(({ text, language, pronunciations, id }, index) => (
          <HStack
            key={id}
            width="full"
            gap={2}
            spacing={0}
            p={6}
            backgroundColor="gray.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.300"
            flexDirection={{ base: 'column', md: 'row' }}
          >
            <Input
              placeholder="Translated sentence"
              defaultValue={text}
              onChange={(e) => handleSelectTranslationText(e.target.value, index)}
            />
            <Box minWidth="200px" width={{ base: 'full', md: 'auto' }}>
              <Select
                className="w-full"
                options={translationLanguageOptions}
                defaultValue={language !== LanguageEnum.UNSPECIFIED ? LanguageLabels[language] : null}
                onChange={(value: { value: LanguageEnum; label: string }) =>
                  handleSelectTranslationLanguage(value.value, index)
                }
              />
            </Box>
            <RecorderBase
              path="pronunciations"
              hideTitle
              onStopRecording={(audioData) => handlePronunciation(audioData, index)}
              onResetRecording={() => handleResetPronunciation(index)}
              audioValue={pronunciations[0].audio}
              toastEnabled={false}
              isMinimal
            />
          </HStack>
        ))}
        {showAddTranslationButton ? (
          <Button variant="primary" leftIcon={<LuPlus />} onClick={handleAddTranslation}>
            Add translation
          </Button>
        ) : null}
      </VStack>
      <ResourceNavigationController
        index={exampleIndex}
        resources={examples}
        onBack={handleBack}
        onNext={handleNext}
        onSkip={noop}
        onComplete={handleComplete}
        isCompleteEnabled={isCompleteEnabled}
        isLoading={isLoading}
      />
    </VStack>
  ) : noExamples ? (
    <EmptyExamples setIsDirty={setIsDirty} />
  ) : isComplete ? (
    <Completed type={CrowdsourcingType.VERIFY_EXAMPLE_AUDIO} setIsComplete={setIsComplete} setIsDirty={setIsDirty} />
  ) : (
    <Spinner />
  );
};

export default TranslateSentences;
