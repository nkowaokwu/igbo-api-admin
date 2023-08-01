import React, { ReactElement } from 'react';
import { Box, Divider, Skeleton, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import userStatBodies from './userStatBodies';

const PersonalStats = ({ userStats }: { userStats: { [key: string]: number } }): ReactElement => (
  <Box className="rounded border p-4 space-y-4 bg-white w-full" borderColor="gray.300">
    <Box>
      <Text fontWeight="bold" fontFamily="Silka" color="gray.700">
        Personal Contributions
      </Text>
      <Text fontFamily="Silka">Total of all contributions</Text>
    </Box>
    <Box width="full">
      <Divider mt={2} />
    </Box>
    <details>
      <summary>View all personal contribution stats</summary>
      <Skeleton isLoaded={!!userStats}>
        <Box className="grid grid-flow-row grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-4">
          {Object.entries(userStats || {}).map(([key, value]: [key: string, value: number]) => (
            <Box key={key}>
              <Box
                className={`flex flex-row justify-between items-center
                rounded bg-white p-4 transition-all duration-200
                ${userStatBodies[key].hash ? 'cursor-pointer hover:bg-blue-100' : ''}`}
              >
                <span>
                  <Text fontFamily="Silka">{userStatBodies[key].label}</Text>
                  <ExternalLinkIcon boxSize={4} />
                </span>
                <Text fontFamily="Silka">{value}</Text>
              </Box>
              <Box width="full">
                <Divider mt={2} />
              </Box>
            </Box>
          ))}
        </Box>
      </Skeleton>
    </details>
  </Box>
);

export default PersonalStats;
