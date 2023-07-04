import React, { ReactElement } from 'react';
import { Box, Divider, Progress, Text, Tooltip } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const calculatePercentage = (numerator, denominator) => Math.floor((numerator / denominator) * 100);

const StatBody = ({
  totalCount: rawTotalCount,
  goal: rawGoal,
  description,
  heading,
  isGeneric = false,
  leftIcon = null,
}: {
  totalCount: number;
  goal: number;
  description: string;
  heading: string;
  isGeneric: boolean;
  leftIcon: ReactElement;
}): ReactElement => {
  const totalCount = (rawTotalCount || 0).toLocaleString(undefined, { minimumFractionDigits: 0 });
  const goal = (rawGoal || 0).toLocaleString(undefined, { minimumFractionDigits: 0 });
  const calculatedPercentage = calculatePercentage(rawTotalCount, rawGoal);
  const colorScheme = calculatedPercentage > 40 ? 'blue' : 'orange';

  return (
    <>
      <Box width="full">
        <Box className="flex flex-row justify-between items-center">
          <Box className="flex flex-row items-center space-x-2">
            <Tooltip label={description}>{leftIcon || <InfoIcon color="gray.500" boxSize={4} />}</Tooltip>
            <Text className="text-gray-800" fontFamily="Silka">
              {heading}
            </Text>
          </Box>
          <Text fontSize="xl" fontFamily="Silka" color="gray.600">
            {isGeneric ? totalCount : `${totalCount} / ${goal}`}
          </Text>
        </Box>
        {!isGeneric ? (
          <Box data-test="linear-progress-bar" className="w-full flex flex-row justify-end w-full mt-4">
            <Tooltip label={`${`${calculatedPercentage}% has been completed`}`}>
              <Box width="full">
                <Progress
                  value={calculatedPercentage}
                  colorScheme={colorScheme}
                  size="lg"
                  width="full"
                  height="8px"
                  borderRadius="full"
                />
              </Box>
            </Tooltip>
          </Box>
        ) : null}
      </Box>
      <Box>
        <Divider backgroundColor="gray.100" />
      </Box>
    </>
  );
};

export default StatBody;
