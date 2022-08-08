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
import RelatedTermsFormInterface from './RelatedTermsFormInterface';
import FormHeader from '../../../FormHeader';

const RelatedTerms = (
  { relatedTermIds, updateRelatedTerms }
  : { relatedTermIds: string[], updateRelatedTerms: (value: string[]) => void },
) => {
  const [resolvedRelatedTerms, setResolvedRelatedTerms] = useState(null);
  const [isLoadingRelatedTerms, setIsLoadingRelatedTerms] = useState(false);
  useEffect(() => {
    (async () => {
      setIsLoadingRelatedTerms(true);
      try {
        setResolvedRelatedTerms(await Promise.all(relatedTermIds.map(async (relatedTermId) => {
          const word = await resolveWord(relatedTermId);
          return word;
        })));
      } finally {
        setIsLoadingRelatedTerms(false);
      }
    })();
  }, [relatedTermIds]);

  return isLoadingRelatedTerms ? (
    <Spinner />
  ) : resolvedRelatedTerms && resolvedRelatedTerms.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3">
      {resolvedRelatedTerms.map((word, index) => (
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
              const filteredRelatedTerms = [...relatedTermIds];
              filteredRelatedTerms.splice(index, 1);
              updateRelatedTerms(filteredRelatedTerms);
            }}
          />
        </Box>
      ))}
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600 mb-4">No related terms</p>
    </Box>
  );
};

const RelatedTermsForm = ({
  errors,
  relatedTerms,
  setRelatedTerms,
  control,
  setValue,
  record,
}: RelatedTermsFormInterface): ReactElement => {
  const [input, setInput] = useState('');
  const toast = useToast();

  const updateRelatedTerms = (value) => {
    setRelatedTerms(value);
    setValue('relatedTerms', value);
  };

  const canAddRelatedTerm = (userInput) => (
    !relatedTerms.includes(userInput)
    && userInput !== record.id
    && userInput !== record.originalWordId
  );

  const handleAddRelatedTerm = async (userInput = input) => {
    try {
      if (canAddRelatedTerm(userInput)) {
        const word = await getWord(userInput);
        updateRelatedTerms([...relatedTerms, word.id]);
      } else {
        throw new Error('Invalid word id');
      }
    } catch (err) {
      toast({
        title: 'Unable to add related term',
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
        name="relatedTerms"
        control={control}
        defaultValue=""
      />
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader
          title="Related Terms"
          tooltip={`Related terms of the current word using Standard Igbo. 
          You can search for a word or paste in the word id.`}
        />
      </Box>
      <Box className="flex flex-row mb-4 space-x-2">
        <Input
          value={input}
          searchApi
          data-test="relatedTerm-search"
          placeholder="Search for a related term or use word id"
          onChange={(e) => setInput(e.target.value)}
          onSelect={(e) => handleAddRelatedTerm(e.id)}
          className="form-input"
        />
        <Tooltip label="Click this button to add the related term">
          <IconButton
            colorScheme="green"
            aria-label="Add Related Term"
            onClick={() => handleAddRelatedTerm()}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Box>
      <RelatedTerms
        relatedTermIds={relatedTerms}
        updateRelatedTerms={updateRelatedTerms}
      />
      {errors.relatedTerms && (
        <p className="error">{errors.relatedTerms.message || errors.relatedTerms[0]?.message}</p>
      )}
    </Box>
  );
};

export default RelatedTermsForm;
