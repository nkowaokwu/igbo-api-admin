import React, { ReactElement } from 'react';
import {
  Box,
  Progress,
  Heading,
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import LinearProgressCardInterface from './LinearProgressCardInterface';

const calculatePercentage = (numerator, denominator) => Math.floor((numerator / denominator) * 100);

const LinearProgressCard = ({
  totalCount,
  goal,
  heading,
  description,
  isLoaded,
}: LinearProgressCardInterface): ReactElement => (
  <Skeleton isLoaded={isLoaded}>
    <Box
      className="text-center flex flex-col items-center"
      backgroundColor="white"
      borderRadius="md"
      boxShadow="lg"
      py={4}
      px={3}
    >
      <Box>
        <Heading fontSize="3xl" className="text-gray-800">{heading}</Heading>
        <Text fontSize="md" className="text-gray-700 italic">
          {description}
        </Text>
      </Box>
      <Box className="w-full flex flex-row justify-end">
        <Box className="flex flex-col justify-center items-center w-full mt-4">
          <Tooltip label={`${`${calculatePercentage(totalCount, goal)}% has been merged`}`}>
            <Box width="full">
              <Progress
                value={calculatePercentage(totalCount, goal)}
                size="lg"
                width="full"
              />
            </Box>
          </Tooltip>
          <Text fontSize="xl" fontWeight="bold">{`${totalCount} / ${goal}`}</Text>
        </Box>
      </Box>
    </Box>
  </Skeleton>
);

export default LinearProgressCard;
