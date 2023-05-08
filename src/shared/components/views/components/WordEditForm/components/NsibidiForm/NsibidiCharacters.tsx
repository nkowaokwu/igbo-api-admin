import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { compact } from 'lodash';
import { WordPills } from 'src/shared/primitives';
import { resolveNsibidiCharacter } from 'src/shared/API';

const NsibidiCharacters = (
  {
    nsibidiCharacterIds,
    remove,
  }
  : {
    nsibidiCharacterIds: { id: string }[],
    remove: (index: number) => void,
  },
): ReactElement => {
  const [resolvedNsibidiCharacters, setResolvedNsibidiCharacters] = useState(null);
  const [isLoadingNsibidiCharacters, setIsLoadingNsibidiCharacters] = useState(false);

  const resolveNsibidiCharacters = async () => {
    setIsLoadingNsibidiCharacters(true);
    try {
      /**
       * We compact the resolved Nsibidi characters so that if an Nsibidi character cannot be found
       * by its MongoDB Id or regular Nsibidi character search the compact array will omit null values.
       */
      const compactedResolvedNsibidiCharacters = compact(
        await Promise.all(nsibidiCharacterIds.map(async ({ id: nsibidiCharacterId }) => {
          const nsibidiCharacter = await resolveNsibidiCharacter(nsibidiCharacterId).catch(() => null);
          return nsibidiCharacter;
        })),
      );
      setResolvedNsibidiCharacters(compactedResolvedNsibidiCharacters);
      return compactedResolvedNsibidiCharacters;
    } finally {
      setIsLoadingNsibidiCharacters(false);
    }
  };

  useEffect(() => {
    (async () => {
      await resolveNsibidiCharacters();
    })();
  }, [nsibidiCharacterIds]);

  return isLoadingNsibidiCharacters ? (
    <Spinner />
  ) : resolvedNsibidiCharacters && resolvedNsibidiCharacters.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3 py-4">
      <WordPills
        pills={resolvedNsibidiCharacters}
        onDelete={remove}
      />
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600 mb-4">No Nsibidi characters</p>
    </Box>
  );
};

export default NsibidiCharacters;
