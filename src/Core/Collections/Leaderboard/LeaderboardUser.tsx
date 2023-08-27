import React, { ReactElement } from 'react';
import { Avatar, Box, Text } from '@chakra-ui/react';

const LeaderboardUser = ({
  displayName,
  photoURL,
  count,
  position,
}: {
  displayName: string;
  photoURL: string;
  email: string;
  count: number;
  position: number;
}): ReactElement => (
  <Box
    className="flex flex-row space-x-3 justify-between items-center py-6"
    borderBottomWidth="1px"
    borderBottomColor="gray.300"
  >
    <Box className="flex flex-row space-x-3 items-center">
      <Text color="gray.500" fontFamily="Silka">{`${position}.`}</Text>
      <Box>
        <Box className="flex flex-row space-x-2 items-center">
          <Avatar src={photoURL} name={displayName} size="sm" />
          <Box>
            <Text fontWeight="bold" fontFamily="Silka">
              {displayName}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
    <Text color="gray.500" fontFamily="Silka">{`${count} points`}</Text>
  </Box>
);

export default LeaderboardUser;
