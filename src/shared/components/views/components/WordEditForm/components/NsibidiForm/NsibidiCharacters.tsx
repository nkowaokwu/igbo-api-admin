import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { Control } from 'react-hook-form';
import { compact } from 'lodash';
import { WordPills } from 'src/shared/primitives';
import { resolveNsibidiCharacter } from 'src/shared/API';
import { NsibidiCharacter } from 'src/backend/controllers/utils/interfaces';

const NsibidiCharacters = (
  {
    nsibidiCharacterIds,
    remove,
    control,
    nsibidiFormName,
  }
  : {
    nsibidiCharacterIds: { id: string }[],
    remove: (index: number) => void,
    control: Control,
    nsibidiFormName: string,
  },
): ReactElement => {
  const [resolvedNsibidiCharacters, setResolvedNsibidiCharacters] = useState<NsibidiCharacter[]>([]);
  const [isLoadingNsibidiCharacters, setIsLoadingNsibidiCharacters] = useState(false);

  const resolveCharacters = async () => {
    const shouldResolve = (
      resolvedNsibidiCharacters?.length !== nsibidiCharacterIds.length
      || !nsibidiCharacterIds.every(({ id }) => (
        resolvedNsibidiCharacters.find(({ id: resolvedId }) => resolvedId === id)
      ))
    );
    if (!shouldResolve) {
      return;
    }

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
      ) as NsibidiCharacter[];
      setResolvedNsibidiCharacters(compactedResolvedNsibidiCharacters);
    } finally {
      setIsLoadingNsibidiCharacters(false);
    }
  };

  useEffect(() => {
    resolveCharacters();
  }, [nsibidiCharacterIds]);

  return isLoadingNsibidiCharacters ? (
    <Spinner />
  ) : resolvedNsibidiCharacters?.length ? (
    <Box display="flex" flexDirection="column" className="space-y-3 py-4">
      <WordPills
        pills={resolvedNsibidiCharacters}
        onDelete={remove}
        control={control}
        formName={nsibidiFormName}
      />
    </Box>
  ) : (
    <Box className="flex w-full justify-center">
      <p className="text-gray-600 mb-4">No Nsịbịdị characters</p>
    </Box>
  );
};

export default NsibidiCharacters;
