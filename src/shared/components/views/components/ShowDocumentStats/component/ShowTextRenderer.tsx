import React, { ReactElement, ReactNode } from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';

const ShowTextRenderer = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactElement;
  children: ReactNode;
}): ReactElement => (
  <Box width="full" borderRadius="lg" borderWidth="1px" borderColor="gray.300">
    <HStack alignItems="center" gap={2} py={2} px={4} borderBottomWidth="1px" borderBottomColor="gray.300" width="full">
      {icon}
      <Text fontWeight="medium">{title}</Text>
    </HStack>
    <VStack alignItems="start" padding={4} width="full">
      {children}
    </VStack>
  </Box>
);

export default ShowTextRenderer;
