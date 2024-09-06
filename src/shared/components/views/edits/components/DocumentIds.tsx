import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Identifier, Record } from 'react-admin';
import { Box, Heading, Text, chakra } from '@chakra-ui/react';
import { determineDate } from '../../shows/utils';

const DocumentIds = ({
  collection,
  originalId = '',
  record,
  id,
  title = '',
}: {
  collection: string;
  originalId?: string;
  record: Record;
  id: Identifier | string;
  title?: string;
}): ReactElement => (
  <Box className="flex flex-col my-2">
    <Heading fontSize="lg" className="text-xl text-gray-700" mb="2">
      {`Last Updated: ${determineDate(get(record, 'updatedAt'))}`}
    </Heading>
    <Heading fontSize="lg" className="text-xl text-gray-700" mb="2">
      {`Created On: ${determineDate(get(record, 'createdAt'))}`}
    </Heading>
    <Box className="flex items-center">
      <Heading fontSize="lg" className="text-l text-gray-600 mr-3">
        Id:
      </Heading>
      <Text fontSize="lg" fontFamily="monospace" className="text-l text-gray-800">
        {id}
      </Text>
    </Box>
    {title ? (
      <Box className="flex items-center">
        <Heading fontSize="lg" className="text-l text-gray-600 mr-3">
          {title}
        </Heading>
        <Text fontFamily={originalId ? 'monospace' : ''} color="gray.800" fontSize="md">
          {originalId ? (
            <a className="link" href={`#/${collection}/${originalId}/show`}>
              {originalId}
            </a>
          ) : (
            <chakra.span color="gray.600" className="italic">
              No original document ID
            </chakra.span>
          )}
        </Text>
      </Box>
    ) : null}
  </Box>
);

export default DocumentIds;
