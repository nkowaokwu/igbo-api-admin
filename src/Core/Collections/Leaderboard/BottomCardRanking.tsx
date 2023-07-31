import React, { ReactElement } from 'react';
import { Avatar, Box, Text } from '@chakra-ui/react';

const BottomCardRanking = ({
  displayName,
  photoURL,
  count,
  position,
}: {
  displayName: string;
  photoURL: string;
  count: number;
  position: number;
}): ReactElement => (
  <Box
    position="fixed"
    bottom={0}
    left={0}
    className="w-full h-18 p-2 bg-white"
    boxShadow="0px -2px 5px var(--chakra-colors-gray-300)"
  >
    <Box className="flex flex-row space-x-3 items-center">
      {typeof position === 'number' ? <Text fontFamily="Silka" color="gray.500">{`${position}.`}</Text> : null}
      <Box>
        <Box className="flex flex-row space-x-2 items-center">
          <Avatar src={photoURL} name={displayName} size="sm" />
          <Box>
            {typeof position === 'number' ? (
              <>
                <Text fontWeight="bold" fontSize="sm" fontFamily="Silka">
                  {displayName}
                </Text>
                <Text color="gray.500" fontSize="sm" fontFamily="Silka">{`${count} points`}</Text>
              </>
            ) : (
              <>
                <Text fontWeight="bold" fontSize="sm" fontFamily="Silka">
                  No available rank
                </Text>
                <Text color="gray.500" fontSize="sm" fontFamily="Silka">
                  Please make a contribution to see your rank
                </Text>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

export default BottomCardRanking;
