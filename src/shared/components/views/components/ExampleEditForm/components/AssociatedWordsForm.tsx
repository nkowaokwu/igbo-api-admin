import React, { ReactElement, useEffect, useState } from 'react';
import { compact } from 'lodash';
import { Box, IconButton, Spinner, Tooltip, useToast } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Control, useFieldArray } from 'react-hook-form';
import { Input, WordPills } from 'src/shared/primitives';
import { resolveWord, getWord, getWords } from 'src/shared/API';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import FormHeader from '../../FormHeader';
import AssociatedWordsFormInterface from './AssociatedWordFormInterface';

const AssociatedWords = ({
  associatedWordIds,
  remove,
  control,
}: {
  associatedWordIds: { text: string }[];
  remove: (index: number) => void;
  control: Control;
}): ReactElement => {
  const [resolvedAssociatedWords, setResolvedAssociatedWords] = useState(null);
  const [isLoadingAssociatedWords, setIsLoadingAssociatedWords] = useState(false);

  const resolveAssociatedWords = async () => {
    const shouldResolve =
      resolvedAssociatedWords?.length !== associatedWordIds.length ||
      !associatedWordIds.every(({ text }) =>
        resolvedAssociatedWords.find(({ text: resolvedId }) => resolvedId === text),
      );
    if (!shouldResolve) {
      return;
    }

    setIsLoadingAssociatedWords(true);
    try {
      const resolvedAssociatedWords = compact(
        await Promise.all(
          compact(associatedWordIds).map(async ({ text: associatedWordId }) => {
            const associatedWord = await resolveWord(associatedWordId).catch(() => null);
            return associatedWord;
          }),
        ),
      );
      setResolvedAssociatedWords(resolvedAssociatedWords);
    } finally {
      setIsLoadingAssociatedWords(false);
    }
  };

  const handleDeleteAssociatedWords = (index: number) => {
    remove(index);
  };

  useEffect(() => {
    resolveAssociatedWords();
  }, [associatedWordIds]);

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

const AssociatedWordsForm = ({ errors, control, record }: AssociatedWordsFormInterface): ReactElement => {
  const [input, setInput] = useState('');
  const toast = useToast();
  const isIgboAPIProject = useIsIgboAPIProject();

  const {
    fields: associatedWords,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'associatedWords',
  });

  const canAddAssociatedWord = (userInput) =>
    !associatedWords.includes(userInput) && userInput !== record.id && userInput !== record.originalExampleId;

  const handleAddAssociatedWord = async (userInput = input) => {
    try {
      if (canAddAssociatedWord(userInput)) {
        const word = (await getWord(userInput)) || (await getWords(userInput))?.[0];
        append({ text: word.id });
      } else {
        throw new Error('Invalid word id');
      }
    } catch (err) {
      toast({
        title: 'Unable to add associated word',
        description: "You have provided either an invalid word id or a the current word's or parent word's id.",
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setInput('');
    }
  };

  return !isIgboAPIProject ? null : (
    <Box className="w-full bg-gray-200 rounded-lg p-2 mb-2">
      <Box className="flex items-center my-5 w-full justify-between">
        <FormHeader title="Associated Words" tooltip="Associated words of the current Igbo example sentence." />
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
            colorScheme="purple"
            aria-label="Add Associated Word"
            onClick={handleAddAssociatedWord}
            icon={<AddIcon />}
          />
        </Tooltip>
      </Box>
      <AssociatedWords associatedWordIds={associatedWords} remove={remove} control={control} />
      {errors.associatedWords && (
        <p className="error">{errors.associatedWords.message || errors.associatedWords[0]?.message}</p>
      )}
    </Box>
  );
};

export default AssociatedWordsForm;
