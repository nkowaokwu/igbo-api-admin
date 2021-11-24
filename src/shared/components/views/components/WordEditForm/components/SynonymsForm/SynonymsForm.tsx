import React, { useState, ReactElement, useEffect } from 'react';
import mongoose from 'mongoose';
import {
  Box,
  IconButton,
  Spinner,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import FormHeader from '../../../FormHeader';
import { Input, WordPill } from '../../../../../../primitives';
import SynonymsFormInterface from './SynonymsFormInterface';
import network from '../../../../../../../Core/Dashboard/network';

const Synonyms = (
  { synonymIds, updateSynonyms }
  : { synonymIds: string[], updateSynonyms: (value: string[]) => void },
) => {
  const [resolvedSynonyms, setResolvedSynonyms] = useState(null);
  const [isLoadingSynonyms, setIsLoadingSynonyms] = useState(false);
  useEffect(() => {
    (async () => {
      setIsLoadingSynonyms(true);
      try {
        setResolvedSynonyms(await Promise.all(synonymIds.map(async (synonymId) => {
          const word = await network({ url: `/words/${synonymId}` }).then(({ json: word }) => word);
          return word;
        })));
      } finally {
        setIsLoadingSynonyms(false);
      }
    })();
  }, [synonymIds]);

  return isLoadingSynonyms ? (
    <Spinner />
  ) : resolvedSynonyms && resolvedSynonyms.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3">
      {resolvedSynonyms.map((word, index) => (
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
              const filteredSynonyms = [...synonymIds];
              filteredSynonyms.splice(index, 1);
              updateSynonyms(filteredSynonyms);
            }}
          />
        </Box>
      ))}
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600">No synonyms</p>
    </Box>
  );
};

const SynonymsForm = ({
  errors,
  synonyms,
  setSynonyms,
  control,
  setValue,
  record,
}: SynonymsFormInterface): ReactElement => {
  const [input, setInput] = useState('');
  const toast = useToast();

  const updateSynonyms = (value) => {
    setSynonyms(value);
    setValue('synonyms', value);
  };

  const canAddSynonym = (userInput) => (
    mongoose.Types.ObjectId.isValid(userInput)
    && !synonyms.includes(userInput)
    && userInput !== record.id
    && userInput !== record.originalWordId
  );

  const handleAddSynonym = async (userInput = input) => {
    if (canAddSynonym(userInput)) {
      const word = await network({ url: `/words/${userInput}` }).then(({ json: word }) => word);
      updateSynonyms([...synonyms, word.id]);
    } else {
      toast({
        title: 'Unable to add synonym',
        description: 'You have provided an either an word id or a the current word\'s or parent word\'s id.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    }
    setInput('');
  };
  return (
    <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2">
      <Controller
        render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
        name="synonyms"
        control={control}
        defaultValue=""
      />
      <Box className="flex items-center my-5 w-full justify-between">
        <Box className="flex flex-col">
          <FormHeader
            title="Synonyms"
            tooltip={`Synonyms of the current word using Standard Igbo. 
            You can search for a word or paste in the word id.`}
          />
        </Box>
      </Box>
      <Box className="flex flex-row mb-4 space-x-2">
        <Input
          value={input}
          searchApi
          data-test="synonym-search"
          placeholder="Search for synonym or use word id"
          onChange={(e) => setInput(e.target.value)}
          onSelect={(e) => handleAddSynonym(e.id)}
          className="form-input"
        />
        <Tooltip label="Click this button to add the synonym">
          <IconButton
            colorScheme="green"
            aria-label="Add Synonym"
            onClick={() => handleAddSynonym()}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Box>
      <Synonyms
        synonymIds={synonyms}
        updateSynonyms={updateSynonyms}
      />
      {errors.synonyms && (
        <p className="error">{errors.synonyms.message || errors.synonyms[0]?.message}</p>
      )}
    </Box>
  );
};

export default SynonymsForm;
