import React, { ReactElement, useEffect, useState } from 'react';
import { compact } from 'lodash';
import {
  Box,
  IconButton,
  Spinner,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Control, Controller } from 'react-hook-form';
import { Input, WordPills } from 'src/shared/primitives';
import { resolveWord, getWord, getWords } from 'src/shared/API';
import FormHeader from '../../FormHeader';
import AssociatedWordsFormInterface from './AssociatedWordFormInterface';

const AssociatedWords = (
  { associatedWordIds, updateAssociatedWords, control }
  : { associatedWordIds: string[], updateAssociatedWords: (value: any) => void, control: Control },
): ReactElement => {
  const [resolvedAssociatedWords, setResolvedAssociatedWords] = useState(null);
  const [isLoadingAssociatedWords, setIsLoadingAssociatedWords] = useState(false);

  const resolveAssociatedWords = (callback) => async () => {
    setIsLoadingAssociatedWords(true);
    try {
      const resolvedAssociatedWords = compact(
        await Promise.all(compact(associatedWordIds).map(async (associatedWordId) => {
          const associatedWord = await resolveWord(associatedWordId).catch(() => null);
          return associatedWord;
        })),
      );
      setResolvedAssociatedWords(resolvedAssociatedWords);
      callback(resolvedAssociatedWords);
    } finally {
      setIsLoadingAssociatedWords(false);
    }
  };

  const handleDeleteAssociatedWords = (index: number) => {
    const filteredAssociatedWords = [...associatedWordIds];
    filteredAssociatedWords.splice(index, 1);
    updateAssociatedWords(filteredAssociatedWords);
  };

  useEffect(() => {
    resolveAssociatedWords((words) => {
      // Removes stale, invalid Word Ids
      updateAssociatedWords(words.map(({ id }) => id));
    })();
  }, []);

  return isLoadingAssociatedWords ? (
    <Spinner />
  ) : resolvedAssociatedWords && resolvedAssociatedWords.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3 py-4">
      <WordPills
        pills={resolvedAssociatedWords}
        onDelete={handleDeleteAssociatedWords}
        control={control}
        formName="associatedWords"
      />
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600">No associated words</p>
    </Box>
  );
};

const AssociatedWordsForm = ({
  errors,
  associatedWords,
  setAssociatedWords,
  control,
  setValue,
  record,
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
        control={control}
      />
      {errors.associatedWords && (
        <p className="error">{errors.associatedWords.message || errors.associatedWords[0]?.message}</p>
      )}
    </Box>
  );
};

export default AssociatedWordsForm;
