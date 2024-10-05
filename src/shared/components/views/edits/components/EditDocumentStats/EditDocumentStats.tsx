import React, { ReactElement } from 'react';
import { Text, chakra, HStack, VStack } from '@chakra-ui/react';
import DocumentStatsInterface from './EditDocumentStatsInterface';

const EditDocumentStats = ({ approvals, denials }: DocumentStatsInterface): ReactElement => (
  <VStack borderRadius="md" borderWidth="1px" borderColor="gray.200" p={2} mt={{ base: 3, lg: 0 }}>
    <HStack className="flex" gap={2}>
      <Text fontWeight="bold" color="gray.800" fontSize="sm">
        Approvals:
        <chakra.span ml={2} fontWeight="normal">
          {approvals?.length}
        </chakra.span>
      </Text>
      <Text fontWeight="bold" color="gray.800" fontSize="sm">
        Denials:
        <chakra.span ml={2} fontWeight="normal">
          {denials?.length}
        </chakra.span>
      </Text>
    </HStack>
  </VStack>
);

export default EditDocumentStats;
