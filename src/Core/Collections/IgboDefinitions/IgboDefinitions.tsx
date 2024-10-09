import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { compact, noop } from 'lodash';
import { Box, Heading, Input, Link, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { usePermissions } from 'react-admin';
import { ActivityButton, Card } from 'src/shared/primitives';
import { IGBO_DEFINITIONS_STANDARDS_DOC } from 'src/Core/constants';
import WordClass from 'src/backend/shared/constants/WordClass';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import { getWordSuggestionsWithoutIgboDefinitions, putWordSuggestionsWithoutIgboDefinitions } from 'src/shared/API';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import SubmitBatchButton from 'src/Core/Collections/components/SubmitBatchButton';
import NavbarWrapper from '../components/NavbarWrapper';
import Completed from '../components/Completed';
import GenerateMoreWordsButton from './components/GenerateMoreWordsButton';

const IgboDefinitions = (): ReactElement => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [igboDefinitions, setIgboDefinitions] = useState<string[]>([]);
  const [wordSuggestions, setWordSuggestions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visitedLastWordSuggestionIndex, setVisitedLastWordSuggestionIndex] = useState(false);
  const [, setIsDirty] = useState(false);
  const igboDefinitionInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const currentCard = wordSuggestions[currentCardIndex];
  const showSubmitButton = visitedLastWordSuggestionIndex && igboDefinitions.some((igboDefinition) => !!igboDefinition);
  const permissions = usePermissions();
  const isAdmin = hasAdminPermissions(permissions?.permissions, true);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = compact(
        igboDefinitions.map(
          (igboDefinition, index) =>
            igboDefinition &&
            wordSuggestions[index].id && {
              id: wordSuggestions[index].id,
              igboDefinition,
            },
        ),
      );
      await putWordSuggestionsWithoutIgboDefinitions(payload);
      setIsComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentCardIndex(currentCardIndex + 1);
    igboDefinitionInputRef.current.focus();
  };

  const handlePrevious = () => {
    setCurrentCardIndex(currentCardIndex - 1);
    igboDefinitionInputRef.current.focus();
  };

  const handleInputChange = (e) => {
    const updatedIgboDefinitions = [...igboDefinitions];
    updatedIgboDefinitions[currentCardIndex] = e.target.value;
    setIgboDefinitions(updatedIgboDefinitions);
  };

  const fetchWordSuggestions = async () => {
    try {
      setIsLoading(true);
      const fetchedWordSuggestions = await getWordSuggestionsWithoutIgboDefinitions();
      setWordSuggestions(fetchedWordSuggestions);
      setIgboDefinitions(fetchedWordSuggestions.map(() => ''));
    } catch (err) {
      toast({
        title: 'Error loading Igbo definitions',
        description: 'Unable to load Igbo definitions. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* Resets the page */
  useEffect(() => {
    if (!isComplete) {
      setCurrentCardIndex(0);
      setWordSuggestions([]);
      setIgboDefinitions([]);
      fetchWordSuggestions();
      if (igboDefinitionInputRef.current) {
        igboDefinitionInputRef.current.focus();
      }
    }
  }, [isComplete]);

  useEffect(() => {
    if (currentCardIndex === wordSuggestions?.length - 1) {
      setVisitedLastWordSuggestionIndex(true);
    }
  }, [currentCardIndex, wordSuggestions]);

  useBeforeWindowUnload();

  return !isComplete ? (
    <Box className="w-11/12 lg:w-full flex flex-col items-center h-full lg:h-auto" my={0} mx="auto">
      <Box className="w-full flex flex-col justify-center items-center">
        <NavbarWrapper>
          <Heading fontFamily="Silka" textAlign="center" width="full" fontSize="3xl" my="4">
            Igbo Definitions
          </Heading>
        </NavbarWrapper>
        {isAdmin ? <GenerateMoreWordsButton isDisabled={!!wordSuggestions?.length} /> : null}
        <Text fontFamily="Silka" mt={4} textAlign="center">
          Each Igbo definition must follow our{' '}
          <Link textDecoration="underline" href={IGBO_DEFINITIONS_STANDARDS_DOC} target="_blank">
            Igbo Definitions Standards
            <ExternalLinkIcon boxSize="3" ml={1} />
          </Link>{' '}
          document.
        </Text>
        {currentCard ? (
          <Card>
            <Box className="flex flex-row justify-start items-center space-x-4">
              <Text fontWeight="bold" fontFamily="Silka">
                {currentCard.word}
              </Text>
              <Text fontStyle="italic" fontFamily="Silka">
                {WordClass[currentCard.definitions[0].wordClass].label}
              </Text>
            </Box>
            <Text fontFamily="Silka" fontStyle={currentCard.definitions[0].definitions[0] ? '' : 'italic'}>
              {currentCard.definitions[0].definitions[0] || 'N/A'}
            </Text>
          </Card>
        ) : isLoading ? (
          <Box minHeight="md" className="flex flex-row justify-center items-center">
            <Spinner />
          </Box>
        ) : null}
      </Box>
      <Box className="w-full">
        <Box className="w-full flex flex-col justify-center items-center space-y-4" mb={12}>
          {currentCard ? (
            <Text fontFamily="Silka" fontWeight="bold">
              {`${currentCardIndex + 1} / ${wordSuggestions.length}`}
            </Text>
          ) : !wordSuggestions?.length && !isLoading ? (
            <Text my={12} fontSize="lg" color="gray.500" fontStyle="italic" fontFamily="heading">
              No available words. Please request more.
            </Text>
          ) : null}
          <SubmitBatchButton
            isLoading={isLoading}
            onClick={handleSubmit}
            isDisabled={!showSubmitButton}
            aria-label="Complete Igbo definitions"
          />
        </Box>
        <Box className="flex flex-row w-full">
          <ActivityButton
            tooltipLabel="Previous Igbo definition"
            onClick={currentCardIndex === 0 ? noop : handlePrevious}
            icon={<ArrowBackIcon color="gray" />}
            aria-label="Previous Igbo definition"
            isDisabled={currentCardIndex === 0}
            left={0}
          />
          <Input
            placeholder="Type Igbo definition here"
            ref={igboDefinitionInputRef}
            px={2}
            value={igboDefinitions[currentCardIndex]}
            onChange={handleInputChange}
          />
          <ActivityButton
            tooltipLabel="Next Igbo definition"
            onClick={currentCardIndex === wordSuggestions.length - 1 ? noop : handleNext}
            variant="primary"
            icon={<ArrowForwardIcon color="white" />}
            aria-label="Next Igbo definition"
            isDisabled={currentCardIndex === wordSuggestions.length - 1}
            right={0}
          />
        </Box>
      </Box>
    </Box>
  ) : (
    <Completed type={CrowdsourcingType.INPUT_IGBO_DEFINITION} setIsComplete={setIsComplete} setIsDirty={setIsDirty} />
  );
};

export default IgboDefinitions;
