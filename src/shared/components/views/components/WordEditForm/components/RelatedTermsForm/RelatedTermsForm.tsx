import React, { useState, ReactElement, useEffect } from 'react';
import { compact } from 'lodash';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import { Control, Controller, useFieldArray } from 'react-hook-form';
import { Input, WordPills } from 'src/shared/primitives';
import { getWord, resolveWord } from 'src/shared/API';
import RelatedTermsFormInterface from './RelatedTermsFormInterface';
import FormHeader from '../../../FormHeader';

const RelatedTerms = (
  { relatedTermIds, remove, control }
  : { relatedTermIds: { id: string }[], remove: (index: number) => void, control: Control },
) => {
  const [resolvedRelatedTerms, setResolvedRelatedTerms] = useState([]);
  const [isLoadingRelatedTerms, setIsLoadingRelatedTerms] = useState(false);

  const resolveRelatedTerms = async () => {
    const shouldResolve = (
      resolvedRelatedTerms?.length !== relatedTermIds.length
      || !relatedTermIds.every(({ id }) => (
        resolvedRelatedTerms.find(({ id: resolvedId }) => resolvedId === id)
      ))
    );
    if (!shouldResolve) {
      return;
    }
    setIsLoadingRelatedTerms(true);
    try {
      const compactedResolvedRelatedTerms = compact(await Promise.all(relatedTermIds
        .map(async ({ id: relatedTermId }) => {
          const word = await resolveWord(relatedTermId).catch(() => null);
          return word;
        })));
      setResolvedRelatedTerms(compactedResolvedRelatedTerms);
    } finally {
      setIsLoadingRelatedTerms(false);
    }
  };

  const handleDeleteRelatedTerms = (index: number) => {
    remove(index);
  };

  useEffect(() => {
    resolveRelatedTerms();
  }, [relatedTermIds]);

  return isLoadingRelatedTerms ? (
    <Spinner />
  ) : resolvedRelatedTerms && resolvedRelatedTerms.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3 py-4">
      <WordPills
        pills={resolvedRelatedTerms}
        onDelete={handleDeleteRelatedTerms}
        control={control}
        formName="relatedTerms"
      />
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600 mb-4 italic">No related terms</p>
    </Box>
  );
};

const RelatedTermsForm = ({
  errors,
  control,
  record,
}: RelatedTermsFormInterface): ReactElement => {
  const { fields: relatedTerms, append, remove } = useFieldArray({
    control,
    name: 'relatedTerms',
  });
  const [input, setInput] = useState('');
  const toast = useToast();

  const canAddRelatedTerm = (userInput) => (
    !relatedTerms.includes(userInput)
    && userInput !== record.id
    && userInput !== record.originalWordId
  );

  const handleAddRelatedTerm = async (userInput = input) => {
    try {
      if (canAddRelatedTerm(userInput)) {
        const word = await getWord(userInput);
        append({ id: word.id });
      } else {
        throw new Error('Invalid word id');
      }
    } catch (err) {
      toast({
        title: 'Unable to add related term',
        description: 'You have provided either an invalid word id or a the current word\'s or parent word\'s id.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setInput('');
    }
  };
  return (
    <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2 " height="fit-content">
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
        />
      </Box>
      <RelatedTerms
        relatedTermIds={relatedTerms}
        remove={remove}
        control={control}
      />
      {errors.relatedTerms && (
        <p className="error">{errors.relatedTerms.message || errors.relatedTerms[0]?.message}</p>
      )}
    </Box>
  );
};

export default RelatedTermsForm;
