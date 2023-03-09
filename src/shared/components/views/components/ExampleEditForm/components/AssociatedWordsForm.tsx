import React, { ReactElement, useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Controller } from 'react-hook-form';
import { Input } from 'src/shared/primitives';
import { getWord, getWords } from 'src/shared/API';
import isResourceSuggestion from 'src/shared/utils/isResourceSuggestion';
import FormHeader from '../../FormHeader';
import AssociatedWordsFormInterface from './AssociatedWordFormInterface';
import AssociatedWords from './AssociatedWords';

const AssociatedWordsForm = ({
  errors,
  associatedWords,
  setAssociatedWords,
  control,
  setValue,
  record,
  resource,
}: AssociatedWordsFormInterface): ReactElement => {
  const [input, setInput] = useState('');
  const toast = useToast();

  const updateAssociatedWords = (value) => {
    setAssociatedWords(value);
    setValue('associatedWords', value);
  };

  const canAddAssociatedWord = (userInput) => (
    !associatedWords.includes(userInput)
    && userInput !== record.id
    && userInput !== record.originalExampleId
  );

  const handleAddAssociatedWord = async (userInput = input) => {
    try {
      if (canAddAssociatedWord(userInput)) {
        const word = await getWord(userInput) || (await getWords(userInput))?.[0];
        updateAssociatedWords([...associatedWords, word.id]);
      } else {
        throw new Error('Invalid word id');
      }
    } catch (err) {
      toast({
        title: 'Unable to add associated word',
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
    <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2">
      <Controller
        render={(props) => <input style={{ position: 'absolute', visibility: 'hidden' }} {...props} />}
        name="associatedWords"
        control={control}
        defaultValue=""
      />
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader
          title="Associated Words"
          tooltip="Associated words of the current Igbo example sentence."
        />
      </Box>
      <Box className="flex flex-row mb-4 space-x-2">
        <Input
          value={input}
          searchApi
          data-test="associatedWord-search"
          placeholder="Search for associated word or use word id"
          onChange={(e) => setInput(e.target.value)}
          onSelect={(e) => handleAddAssociatedWord(e.id)}
        />
        <Tooltip label="Click this button to add the associated word">
          <IconButton
            colorScheme="green"
            aria-label="Add Associated Word"
            onClick={handleAddAssociatedWord}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Box>
      <AssociatedWords
        associatedWordIds={associatedWords}
        updateAssociatedWords={updateAssociatedWords}
        isSuggestion={isResourceSuggestion(resource)}
      />
      {errors.associatedWords && (
        <p className="error">{errors.associatedWords.message || errors.associatedWords[0]?.message}</p>
      )}
    </Box>
  );
};

export default AssociatedWordsForm;
