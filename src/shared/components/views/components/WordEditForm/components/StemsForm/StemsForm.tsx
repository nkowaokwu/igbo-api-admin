import React, { useEffect, useState, ReactElement } from 'react';
import {
  Box,
  IconButton,
  Spinner,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { compact } from 'lodash';
import { Controller } from 'react-hook-form';
import FormHeader from '../../../FormHeader';
import { Input, WordPill } from '../../../../../../primitives';
import network from '../../../../../../../Core/Dashboard/network';
import StemsFormInterface from './StemsFormInterface';

const Stems = (
  { stemIds, updateStems }
  : { stemIds: string[], updateStems: (value: string[]) => void },
) => {
  const [resolvedStems, setResolvedStems] = useState(null);
  const [isLoadingStems, setIsLoadingStems] = useState(false);
  useEffect(() => {
    (async () => {
      setIsLoadingStems(true);
      try {
        /**
         * We compact the resolved stems so that if a word cannot be found
         * by its MongoDB Id or regular word search, the compact array will be used
         * to save the Word Suggestion, omitting the unwanted word.
         */
        const compactedResolvedStems = compact(await Promise.all(stemIds.map(async (stemId) => {
          const word = await network({ url: `/words/${stemId}` })
            .then(({ json: word }) => word)
            .catch(async () => {
              /**
               * If there is a regular word string (not a MongoDB Id) then the platform
               * will search the Igbo API and find the matching word and insert
               * that word's id
               */

              const { json: wordsResults } = await network({ url: `/words?keyword=${stemId}` });
              const fallbackWord = wordsResults.find(({ word }) => word.normalize('NFD') === stemId.normalize('NFD'));
              return fallbackWord;
            });
          return word;
        })));
        setResolvedStems(compactedResolvedStems);
        if (!(resolvedStems && resolvedStems.every(({ id }, index) => stemIds[index] === id))) {
          updateStems(compactedResolvedStems.map(({ id }) => id));
        }
      } finally {
        setIsLoadingStems(false);
      }
    })();
  }, [stemIds]);

  return isLoadingStems ? (
    <Spinner />
  ) : resolvedStems && resolvedStems.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3">
      {resolvedStems.map((word, index) => (
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
              const filteredStems = [...stemIds];
              filteredStems.splice(index, 1);
              updateStems(filteredStems);
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

const StemsForm = ({
  errors,
  stems,
  setStems,
  control,
  setValue,
  record,
} : StemsFormInterface): ReactElement => {
  const [input, setInput] = useState('');
  const toast = useToast();

  const updateStems = (value) => {
    setStems(value);
    setValue('stems', value);
  };

  const canAddStem = (userInput) => (
    !stems.includes(userInput)
    && userInput !== record.id
    && userInput !== record.originalWordId
  );

  const handleAddStem = async (userInput = input) => {
    try {
      if (canAddStem(userInput)) {
        const word = await network({ url: `/words/${userInput}` }).then(({ json: word }) => word);
        updateStems([...stems, word.id]);
      } else {
        throw new Error('Invalid word id');
      }
    } catch (err) {
      toast({
        title: 'Unable to add synonym',
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
        name="stems"
        control={control}
        defaultValue=""
      />
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader
          title="Word Stems"
          tooltip={`Root or stem Igbo words when combined with other stems create new words.
          Please add tone markings.`}
        />
      </Box>
      <Box className="flex flex-row mb-4 space-x-2">
        <Input
          value={input}
          searchApi
          data-test="stem-search"
          placeholder="Search for stem or use word id"
          onChange={(e) => setInput(e.target.value)}
          onSelect={(e) => handleAddStem(e.id)}
          className="form-input"
        />
        <Tooltip label="Click this button to add the stem">
          <IconButton
            colorScheme="green"
            aria-label="Add stem"
            onClick={() => handleAddStem()}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Box>
      <Stems
        stemIds={stems}
        updateStems={updateStems}
      />
      {errors.stems && (
        <p className="error">{errors.stems.message || errors.stems[0]?.message}</p>
      )}
    </Box>
  );
};

export default StemsForm;
