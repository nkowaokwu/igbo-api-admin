import React, { ReactElement } from 'react';
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import ProgressCardInterface from './ProgressCardInterface';

const calculatePercentage = (numerator, denominator) => Math.floor((numerator / denominator) * 100);

const ProgressCard = ({
  totalCount,
  goal,
  heading,
  description,
  isLoaded,
}: ProgressCardInterface): ReactElement => (
  <Skeleton isLoaded={isLoaded}>
    <Box
      className="text-center flex flex-row items-center"
      backgroundColor="white"
      borderRadius="md"
      boxShadow="lg"
      py={4}
      px={3}
    >
      <Box>
        <Heading fontSize="3xl">{heading}</Heading>
        <Text fontSize="md" className="text-gray-700 italic">
          {description}
        </Text>
      </Box>
      <Box className="w-full flex flex-row justify-end">
        <Box className="flex flex-col justify-center items-center">
          <CircularProgress
            value={calculatePercentage(totalCount, goal)}
            size="120px"
            capIsRound
          >
            <CircularProgressLabel>
              {`${calculatePercentage(totalCount, goal)}%`}
            </CircularProgressLabel>
          </CircularProgress>
          <Text fontSize="xl" fontWeight="bold">{`${totalCount} / ${goal}`}</Text>
        </Box>
      </Box>
    </Box>
  </Skeleton>
);

export default ProgressCard;
