import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
} from 'react';
import { compact, noop } from 'lodash';
import {
  Box,
  Heading,
  Input,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { ActivityButton, Card, PrimaryButton } from 'src/shared/primitives';
import WordClass from 'src/backend/shared/constants/WordClass';
import useBeforeWindowUnload from 'src/hooks/useBeforeWindowUnload';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import { getWordSuggestionsWithoutIgboDefinitions, setWordSuggestionsWithoutIgboDefinitions } from 'src/shared/API';
import NavbarWrapper from '../components/NavbarWrapper';
import Completed from '../components/Completed';

const IgboDefinitions = (): ReactElement => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [igboDefinitions, setIgboDefinitions] = useState<string[]>([]);
  const [wordSuggestions, setWordSuggestions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsDirty] = useState(false);
  const igboDefinitionInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const currentCard = wordSuggestions[currentCardIndex];
  const showSubmitButton = (
    currentCardIndex === wordSuggestions.length - 1
    && igboDefinitions.some((igboDefinition) => !!igboDefinition)
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = compact(igboDefinitions.map((igboDefinition, index) => igboDefinition && ({
        id: wordSuggestions[index]._id,
        igboDefinition,
      })));
      await setWordSuggestionsWithoutIgboDefinitions(payload);
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
  useBeforeWindowUnload();

  return !isComplete ? (
    <Box className="flex flex-col justify-center items-center">
      <Box className="w-11/12 lg:w-full flex flex-col justify-center items-center">
        <NavbarWrapper>
          <Heading fontFamily="Silka" textAlign="center" width="full">Igbo Definitions</Heading>
        </NavbarWrapper>
        {currentCard ? (
          <Card>
            <Box className="flex flex-row justify-start items-center space-x-4">
              <Text fontWeight="bold">{currentCard.word}</Text>
              <Text fontStyle="italic">{WordClass[currentCard.definitions[0].wordClass].label}</Text>
            </Box>
            <Text>{currentCard.definitions[0].definitions[0]}</Text>
          </Card>
        ) : isLoading ? (
          <Box minHeight="md" className="flex flex-row justify-center items-center">
            <Spinner color="green" />
          </Box>
        ) : null}
        <Box className="w-full flex flex-col justify-center items-center space-y-4" mb={12}>
          {currentCard ? <Text>{`${currentCardIndex + 1} / ${wordSuggestions.length}`}</Text> : null}
          {showSubmitButton ? (
            <PrimaryButton
              onClick={isLoading ? noop : handleSubmit}
              rightIcon={(() => <>💾</>)()}
              aria-label="Complete Igbo definitions"
              disabled={isLoading}
            >
              Submit
            </PrimaryButton>
          ) : null}
        </Box>
        <Box className="flex flex-row relative w-full">
          <Input
            placeholder="Type Igbo definition here"
            ref={igboDefinitionInputRef}
            px={12}
            value={igboDefinitions[currentCardIndex]}
            onChange={handleInputChange}
          />
          <ActivityButton
            tooltipLabel="Previous Igbo definition"
            onClick={currentCardIndex === 0 ? noop : handlePrevious}
            icon={<ArrowBackIcon />}
            aria-label="Previous Igbo definition"
            position="absolute"
            disabled={currentCardIndex === 0}
            left={0}
          />
          <ActivityButton
            tooltipLabel="Next Igbo definition"
            onClick={currentCardIndex === wordSuggestions.length - 1 ? noop : handleNext}
            icon={<ArrowForwardIcon />}
            aria-label="Next Igbo definition"
            position="absolute"
            disabled={currentCardIndex === wordSuggestions.length - 1}
            right={0}
          />
        </Box>
      </Box>
    </Box>
  ) : (
    <Completed
      type={CrowdsourcingType.INPUT_IGBO_DEFINITION}
      setIsComplete={setIsComplete}
      setIsDirty={setIsDirty}
      goHome={() => noop}
    />
  );
};

export default IgboDefinitions;
