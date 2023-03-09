import React, { ReactElement } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

const EditDocumentIds = ({
  collection,
  originalId,
  id,
  title,
} : {
  collection: string,
  originalId: string,
  id: Interfaces.Word['id'] | string,
  title: string,
}): ReactElement => (
  <Box className="flex flex-col my-2">
    <Box className="flex items-center">
      <Heading fontSize="lg" className="text-l text-gray-600 mr-3">Id:</Heading>
      <Text fontSize="lg" fontFamily="monospace" className="text-l text-gray-800">{id}</Text>
    </Box>
    <Box className="flex items-center">
      <Heading fontSize="lg" className="text-l text-gray-600 mr-3">{title}</Heading>
      <Text fontSize="lg" fontFamily={originalId ? 'monospace' : ''} className="text-l text-gray-800">
        {originalId ? (
          <a
            className="link"
            href={`#/${collection}/${originalId}/show`}
          >
            {originalId}
          </a>
        ) : (
          'N/A'
        )}
      </Text>
    </Box>
  </Box>
);

export default EditDocumentIds;
