import React, { ReactElement, useEffect, useState } from 'react';
import { compact } from 'lodash';
import { Box, Spinner } from '@chakra-ui/react';
import { WordPill } from 'src/shared/primitives';
import { resolveWord } from 'src/shared/API';

const AssociatedWords = (
  {
    associatedWordIds,
    updateAssociatedWords,
    isSuggestion,
  }
  : {
    associatedWordIds: string[],
    updateAssociatedWords: (value: any) => void,
    isSuggestion: boolean,
  },
): ReactElement => {
  const [resolvedAssociatedWords, setResolvedAssociatedWords] = useState(null);
  const [isLoadingAssociatedWords, setIsLoadingAssociatedWords] = useState(false);

  const resolveAssociatedWords = (callback) => async () => {
    setIsLoadingAssociatedWords(true);
    try {
      const resolvedAssociatedWords = compact(
        await Promise.all(compact(associatedWordIds).map(async (associatedWordId) => {
          const associatedWord = await resolveWord(associatedWordId, isSuggestion).catch(() => null);
          return associatedWord;
        })),
      );
      setResolvedAssociatedWords(resolvedAssociatedWords);
      callback(resolvedAssociatedWords);
    } finally {
      setIsLoadingAssociatedWords(false);
    }
  };

  useEffect(() => {
    resolveAssociatedWords((words) => {
      // Removes stale, invalid Word Ids
      updateAssociatedWords(words.map(({ id }) => id));
    })();
  }, []);

  useEffect(() => {
    resolveAssociatedWords(() => {})();
  }, [associatedWordIds]);

  return isLoadingAssociatedWords ? (
    <Spinner />
  ) : resolvedAssociatedWords && resolvedAssociatedWords.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3 py-4">
      {resolvedAssociatedWords.map((associatedWord, index) => (
        <Box
          key={associatedWord.id}
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
            {...associatedWord}
            index={index}
            onDelete={() => {
              const filteredAssociatedWords = [...associatedWordIds];
              filteredAssociatedWords.splice(index, 1);
              updateAssociatedWords(filteredAssociatedWords);
            }}
          />
        </Box>
      ))}
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600">No associated words</p>
    </Box>
  );
};

export default AssociatedWords;
