import React, { useState, ReactElement, useEffect } from 'react';
import {
  Box,
  IconButton,
  Spinner,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import { Input, WordPill } from 'src/shared/primitives';
import { getWord, resolveWord } from 'src/shared/API';
import AntonymsFormInterface from './AntonymsFormInterface';
import FormHeader from '../../../FormHeader';

const Antonyms = (
  { antonymIds, updateAntonyms }
  : { antonymIds: string[], updateAntonyms: (value: string[]) => void },
) => {
  const [resolvedAntonyms, setResolvedAntonyms] = useState(null);
  const [isLoadingAntonyms, setIsLoadingAntonyms] = useState(false);
  useEffect(() => {
    (async () => {
      setIsLoadingAntonyms(true);
      try {
        setResolvedAntonyms(await Promise.all(antonymIds.map(async (antonymId) => {
          const word = await resolveWord(antonymId);
          return word;
        })));
      } finally {
        setIsLoadingAntonyms(false);
      }
    })();
  }, [antonymIds]);

  return isLoadingAntonyms ? (
    <Spinner />
  ) : resolvedAntonyms && resolvedAntonyms.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3">
      {resolvedAntonyms.map((word, index) => (
        <Box
          key={word.id}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          borderColor="blue.400"
          borderWidth="1px"
          backgroundColor="blue.50"
          borderRadius="full"
          minWidth="36"
          py={2}
          px={6}
        >
          <WordPill
            {...word}
            index={index}
            onDelete={() => {
              const filteredAntonyms = [...antonymIds];
              filteredAntonyms.splice(index, 1);
              updateAntonyms(filteredAntonyms);
            }}
          />
        </Box>
      ))}
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600">No antonyms</p>
    </Box>
  );
};

const AntonymsForm = ({
  errors,
  antonyms,
  setAntonyms,
  control,
  setValue,
  record,
}: AntonymsFormInterface): ReactElement => {
  const [input, setInput] = useState('');
  const toast = useToast();

  const updateAntonyms = (value) => {
    setAntonyms(value);
    setValue('antonyms', value);
  };

  const canAddAntonym = (userInput) => (
    !antonyms.includes(userInput)
    && userInput !== record.id
    && userInput !== record.originalWordId
  );

  const handleAddAntonym = async (userInput = input) => {
    try {
      if (canAddAntonym(userInput)) {
        const word = await getWord(userInput);
        updateAntonyms([...antonyms, word.id]);
      } else {
        throw new Error('Invalid word id');
      }
    } catch (err) {
      toast({
        title: 'Unable to add antonym',
        description: 'You have provided an either an invalid word id or a the current word\'s or parent word\'s id.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setInput('');
    }
  };
  return (
    <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2">
      <Controller
        render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
        name="antonyms"
        control={control}
        defaultValue=""
      />
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader
          title="Antonyms"
          tooltip={`Antonyms of the current word using Standard Igbo. 
          You can search for a word or paste in the word id.`}
        />
      </Box>
      <Box className="flex flex-row mb-4 space-x-2">
        <Input
          value={input}
          searchApi
          data-test="antonym-search"
          placeholder="Search for antonym or use word id"
          onChange={(e) => setInput(e.target.value)}
          onSelect={(e) => handleAddAntonym(e.id)}
          className="form-input"
        />
        <Tooltip label="Click this button to add the antonym">
          <IconButton
            colorScheme="green"
            aria-label="Add Antonym"
            onClick={() => handleAddAntonym()}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Box>
      <Antonyms
        antonymIds={antonyms}
        updateAntonyms={updateAntonyms}
      />
      {errors.antonyms && (
        <p className="error">{errors.antonyms.message || errors.antonyms[0]?.message}</p>
      )}
    </Box>
  );
};

export default AntonymsForm;
