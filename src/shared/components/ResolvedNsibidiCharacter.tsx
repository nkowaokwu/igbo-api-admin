import React, { useEffect, useState, ReactElement } from 'react';
import { Box, Spinner, Text, Tooltip } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { getNsibidiCharacter } from '../API';
import Collections from '../constants/Collections';

const ResolvedNsibidiCharacter = ({ nsibidiCharacterId }: { nsibidiCharacterId: string }): ReactElement => {
  const [resolvedNsibidiCharacter, setResolvedNsibidiCharacter] = useState(null);
  const [isLinked, setIsLinked] = useState(true);

  useEffect(() => {
    (async () => {
      const nsibidiCharacter = await getNsibidiCharacter(nsibidiCharacterId).catch(() => {
        setIsLinked(false);
        return { nsibidiCharacter: nsibidiCharacterId };
      });
      setResolvedNsibidiCharacter(nsibidiCharacter);
    })();
  }, []);

  return resolvedNsibidiCharacter ? (
    isLinked ? (
      <a
        className="text-blue-400 underline akagu"
        href={`#/${Collections.NSIBIDI_CHARACTERS}/${nsibidiCharacterId}/show`}
      >
        {resolvedNsibidiCharacter.nsibidi}
      </a>
    ) : (
      <Tooltip
        label={`This Nsibidi character metadata is not linked. To properly link this 
        metadata to the Nsibidi character, edit this Nsibidi character and link this metadata.`}
        backgroundColor="orange.300"
        color="black"
      >
        <Box display="flex" alignItems="center" fontFamily="monospace" className="space-x-2">
          <Text color="orange.600" fontWeight="bold" cursor="default">
            {resolvedNsibidiCharacter.nsibidi}
          </Text>
          <WarningIcon color="orange.600" boxSize={3} className="ml-2" />
        </Box>
      </Tooltip>
    )
  ) : (
    <Spinner />
  );
};

export default ResolvedNsibidiCharacter;
