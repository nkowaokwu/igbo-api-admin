import React, { useState, useEffect, ReactElement } from 'react';
import { compact } from 'lodash';
import { Box, Spinner } from '@chakra-ui/react';
import { WordPill } from 'src/shared/primitives';
import { resolveWord } from 'src/shared/API';

const RelatedTerms = (
  {
    relatedTermIds,
    updateRelatedTerms,
    isSuggestion,
  }
  : {
    relatedTermIds: string[],
    updateRelatedTerms: (value: string[]) => void,
    isSuggestion: boolean,
  },
): ReactElement => {
  const [resolvedRelatedTerms, setResolvedRelatedTerms] = useState(null);
  const [isLoadingRelatedTerms, setIsLoadingRelatedTerms] = useState(false);

  const resolveRelatedTerms = (callback) => async () => {
    setIsLoadingRelatedTerms(true);
    try {
      const compactedResolvedRelatedTerms = compact(await Promise.all(relatedTermIds.map(async (relatedTermId) => {
        const word = await resolveWord(relatedTermId, isSuggestion).catch(() => null);
        return word;
      })));
      setResolvedRelatedTerms(compactedResolvedRelatedTerms);
      callback(compactedResolvedRelatedTerms);
    } finally {
      setIsLoadingRelatedTerms(false);
    }
  };
  useEffect(() => {
    resolveRelatedTerms((relatedTerms) => {
      // Remove stale, invalid Word Ids
      updateRelatedTerms(relatedTerms.map(({ id }) => id));
    })();
  }, []);
  useEffect(() => {
    resolveRelatedTerms(() => {})();
  }, [relatedTermIds]);

  return isLoadingRelatedTerms ? (
    <Spinner />
  ) : resolvedRelatedTerms && resolvedRelatedTerms.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3 py-4">
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
      <p className="text-gray-600 mb-4 italic">No related terms</p>
    </Box>
  );
};

export default RelatedTerms;
