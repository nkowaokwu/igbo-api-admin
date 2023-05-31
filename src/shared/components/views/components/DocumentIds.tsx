import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Record } from 'react-admin';
import { Box, Heading, Text } from '@chakra-ui/react';
import { determineDate } from '../shows/utils';

const DocumentIds = ({
  collection,
  originalId,
  record,
  id,
  title,
} : {
  collection: string,
  originalId: string,
  record: Record,
  id: string,
  title: string,
}): ReactElement => (
  <Box className="flex flex-col my-2">
    <Heading fontSize="lg" className="text-xl text-gray-700" mb="2">
      {`Last Updated: ${determineDate(get(record, 'updatedAt'))}`}
    </Heading>
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

export default DocumentIds;
