import React, { ReactElement } from 'react';
import { Box, Divider, HStack, Text, Tooltip } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import numberWithCommas from 'src/utils/numberWithCommas';

const StatBody = ({
  totalCount,
  description,
  heading,
  leftIcon = null,
}: {
  totalCount: number;
  description: string;
  heading: string;
  leftIcon?: ReactElement;
}): ReactElement => (
  <>
    <HStack width="full" justifyContent="space-between" alignItems="center">
      <HStack alignItems="center" gap={2} width="full">
        <Tooltip label={description}>{leftIcon || <InfoIcon color="gray.500" boxSize={4} />}</Tooltip>
        <Text className="text-gray-800" fontFamily="Silka">
          {heading}
        </Text>
      </HStack>
      <Text>{numberWithCommas(totalCount ?? 0)}</Text>
    </HStack>
    <Box>
      <Divider backgroundColor="gray.100" />
    </Box>
  </>
);

export default StatBody;
