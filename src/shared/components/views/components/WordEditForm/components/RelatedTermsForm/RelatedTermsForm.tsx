import React, { useState, ReactElement } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import { getWord } from 'src/shared/API';
import RelatedTermsFormInterface from './RelatedTermsFormInterface';
import FormHeader from '../../../FormHeader';
import RelatedTerms from './RelatedTerms';

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
