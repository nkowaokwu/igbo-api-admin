import React, { ReactElement } from 'react';
import { Box, Text } from '@chakra-ui/react';
import DocumentStatsInterface from './EditDocumentStatsInterface';

const EditDocumentStats = ({ approvals, denials }: DocumentStatsInterface): ReactElement => (
  <Box
    className="flex flex-col rounded border border-solid border-gray-200 shadow-md fit-content py-3 px-5 mt-3 lg:mt-0"
    style={{ width: 'fit-content' }}
  >
    <Box className="flex">
      <Text fontWeight="bold" className="text-xl text-gray-800 mr-2">Approvals:</Text>
      <Text className="text-xl text-gray-800">{approvals?.length}</Text>
      <Text fontWeight="bold" className="ml-3 text-xl text-gray-800 mr-2">Denials:</Text>
      <Text className="text-xl text-gray-800">{denials?.length}</Text>
    </Box>
  </Box>
);

export default EditDocumentStats;
