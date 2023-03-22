import React, { useEffect, useState, ReactElement } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { compact } from 'lodash';
import { WordPill } from 'src/shared/primitives';
import { resolveWord } from 'src/shared/API';

const Stems = (
  {
    stemIds,
    updateStems,
  }
  : {
    stemIds: string[],
    updateStems: (value: string[]) => void,
  },
): ReactElement => {
  const [resolvedStems, setResolvedStems] = useState(null);
  const [isLoadingStems, setIsLoadingStems] = useState(false);

  const resolveStems = (callback) => async () => {
    setIsLoadingStems(true);
    try {
      /**
       * We compact the resolved stems so that if a word cannot be found
       * by its MongoDB Id or regular word search, the compact array will be used
       * to save the Word Suggestion, omitting the unwanted word.
       */
      const compactedResolvedStems = compact(await Promise.all(stemIds.map(async (stemId) => {
        const word = await resolveWord(stemId).catch(() => null);
        return word;
      })));
      setResolvedStems(compactedResolvedStems);
      callback(compactedResolvedStems);
      if (!(resolvedStems && resolvedStems.every(({ id }, index) => stemIds[index] === id))) {
        updateStems(compactedResolvedStems.map(({ id }) => id));
      }
    } finally {
      setIsLoadingStems(false);
    }
  };

  useEffect(() => {
    resolveStems((stems) => {
      // Remove stale, invalid Word Ids
      updateStems(stems.map(({ id }) => id));
    })();
  }, []);
  useEffect(() => {
    resolveStems(() => {})();
  }, [stemIds]);

  return isLoadingStems ? (
    <Spinner />
  ) : resolvedStems && resolvedStems.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3 py-4">
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
      <p className="text-gray-600 mb-4">No stems</p>
    </Box>
  );
};

export default Stems;
