import React, { ReactElement } from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';

const Clients = (): ReactElement => (
  <VStack width="full" py={32}>
    <VStack className="w-10/12" gap={12}>
      <Text fontWeight="bold">Loved by AI teams</Text>
      <HStack gap={12} width="full" justifyContent="center">
        <Box backgroundColor="orange.300" borderRadius="lg" height="100px" width="200px" />
        <Box backgroundColor="orange.300" borderRadius="lg" height="100px" width="200px" />
      </HStack>
    </VStack>
  </VStack>
);

export default Clients;
